<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use RuntimeException;
use Throwable;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $students = Student::query()
                ->when($search !== '', function ($query) use ($search) {
                    $query->where(function ($query) use ($search) {
                        $query->where('student_number', 'like', "%{$search}%")
                            ->orWhere('first_name', 'like', "%{$search}%")
                            ->orWhere('middle_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('section', 'like', "%{$search}%")
                            ->orWhere('grade_level', 'like', "%{$search}%");
                    });
                })
                ->orderBy('last_name')
                ->paginate(10)
                ->withQueryString();

        $students->getCollection()->transform(
            fn (Student $student) => $this->studentData($student, $request)
        );

        return response()->json($students);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_number' => ['required', 'string', 'max:50', 'unique:students,student_number'],
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
            'sex' => ['required', Rule::in(['Male', 'Female'])],
            'strand' => ['nullable', 'string', 'max:100'],
            'section' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255', 'unique:students,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'grade_level' => ['required', 'integer', 'between:7,12'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ]);

        $photo = $request->file('photo');
        unset($validated['photo']);

        $photoPath = $photo?->store('student-photos', 'public');
        if ($photo && ! $photoPath) {
            throw new RuntimeException('Unable to store student photo.');
        }

        try {
            $student = Student::create([
                ...$validated,
                'photo_path' => $photoPath,
            ]);
        } catch (Throwable $exception) {
            if ($photoPath) {
                Storage::disk('public')->delete($photoPath);
            }

            throw $exception;
        }

        return response()->json([
            'message' => 'Student created successfully.',
            'data' => $this->studentData($student, $request),
        ], 201);
    }

    public function show(Student $student)
    {
        return response()->json([
            'data' => $this->studentData($student, request()),
        ]);
    }

    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'student_number' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('students', 'student_number')->ignore($student->id)],
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'middle_name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'photo' => ['sometimes', 'nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
            'remove_photo' => ['sometimes', 'boolean'],
            'sex' => ['sometimes', 'required', Rule::in(['Male', 'Female'])],
            'strand' => ['sometimes', 'nullable', 'string', 'max:100'],
            'section' => ['sometimes', 'nullable', 'string', 'max:100'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255', Rule::unique('students', 'email')->ignore($student->id)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'grade_level' => ['sometimes', 'required', 'integer', 'between:7,12'],
            'status' => ['sometimes', 'required', Rule::in(['active', 'inactive'])],
        ]);

        $photo = $request->file('photo');
        $removePhoto = (bool) ($validated['remove_photo'] ?? false);
        unset($validated['photo'], $validated['remove_photo']);

        $oldPhotoPath = $student->photo_path;
        $newPhotoPath = $photo?->store('student-photos', 'public');
        if ($photo && ! $newPhotoPath) {
            throw new RuntimeException('Unable to store student photo.');
        }

        if ($newPhotoPath) {
            $validated['photo_path'] = $newPhotoPath;
        } elseif ($removePhoto) {
            $validated['photo_path'] = null;
        }

        try {
            $student->update($validated);
        } catch (Throwable $exception) {
            if ($newPhotoPath) {
                Storage::disk('public')->delete($newPhotoPath);
            }

            throw $exception;
        }

        if (($newPhotoPath || $removePhoto) && $oldPhotoPath) {
            Storage::disk('public')->delete($oldPhotoPath);
        }

        return response()->json([
            'message' => 'Student updated successfully.',
            'data' => $this->studentData($student->fresh(), $request),
        ]);
    }

    public function destroy(Student $student)
    {
        if ($student->photo_path) {
            Storage::disk('public')->delete($student->photo_path);
        }

        $student->delete();

        return response()->json([
            'message' => 'Student deleted successfully.',
        ]);
    }

    private function studentData(Student $student, Request $request): array
    {
        $data = $student->toArray();
        $data['photo_url'] = $student->photo_path
            ? $request->getSchemeAndHttpHost().'/storage/'.$student->photo_path
            : null;

        return $data;
    }
}
