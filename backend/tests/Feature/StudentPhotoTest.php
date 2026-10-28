<?php

namespace Tests\Feature;

use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StudentPhotoTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_student_photo_can_be_uploaded_replaced_and_deleted(): void
    {
        Storage::fake('public');

        $studentData = [
            'student_number' => '2026-0001',
            'first_name' => 'Jamie',
            'last_name' => 'Santos',
            'sex' => 'Female',
            'grade_level' => 7,
            'photo' => $this->fakePng('student.png'),
        ];

        $createResponse = $this->post('/api/students', $studentData, [
            'Accept' => 'application/json',
        ]);

        $createResponse->assertCreated();
        $student = Student::firstOrFail();
        $firstPhotoPath = $student->photo_path;
        Storage::disk('public')->assertExists($firstPhotoPath);
        $createResponse->assertJsonPath(
            'data.photo_url',
            'http://localhost/storage/'.$firstPhotoPath,
        );

        $this->post('/api/students/'.$student->id, [
            '_method' => 'PUT',
            'photo' => $this->fakePng('replacement.png'),
        ], [
            'Accept' => 'application/json',
        ])->assertOk();

        $student->refresh();
        Storage::disk('public')->assertMissing($firstPhotoPath);
        Storage::disk('public')->assertExists($student->photo_path);

        $replacementPhotoPath = $student->photo_path;
        $this->post('/api/students/'.$student->id, [
            '_method' => 'PUT',
            'remove_photo' => '1',
        ], [
            'Accept' => 'application/json',
        ])->assertOk();

        $student->refresh();
        $this->assertNull($student->photo_path);
        Storage::disk('public')->assertMissing($replacementPhotoPath);

        $this->post('/api/students/'.$student->id, [
            '_method' => 'PUT',
            'photo' => $this->fakePng('final.png'),
        ], [
            'Accept' => 'application/json',
        ])->assertOk();
        $student->refresh();

        $this->deleteJson('/api/students/'.$student->id)->assertOk();
        Storage::disk('public')->assertMissing($student->photo_path);
    }

    private function fakePng(string $name): UploadedFile
    {
        $contents = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/rN8AAAAASUVORK5CYII=',
            true,
        );

        return UploadedFile::fake()->createWithContent($name, $contents);
    }
}
