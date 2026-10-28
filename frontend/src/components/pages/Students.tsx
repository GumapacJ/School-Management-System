import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../api";

type Student = {
  id: number;
  student_number: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  sex: string;
  strand?: string | null;
  section?: string | null;
  email?: string | null;
  phone?: string | null;
  grade_level: number;
  status: string;
  photo_path?: string | null;
  photo_url?: string | null;
};

type StudentForm = Omit<Student, "id" | "photo_path" | "photo_url">;

type SelectedPhoto = {
  file: File;
  previewUrl: string;
};

type StudentPage = {
  data: Student[];
  current_page: number;
  last_page: number;
  total: number;
};

type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

const emptyForm: StudentForm = {
  student_number: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  sex: "",
  strand: "",
  section: "",
  email: "",
  phone: "",
  grade_level: 7,
  status: "active",
};

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedPhoto | null>(
    null,
  );
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    return () => {
      if (selectedPhoto) URL.revokeObjectURL(selectedPhoto.previewUrl);
    };
  }, [selectedPhoto]);

  const loadStudents = useCallback(async (page: number, searchTerm: string) => {
    const activeRequest = ++requestId.current;
    try {
      const response = await api.get<StudentPage>("/students", {
        params: { page, search: searchTerm.trim() || undefined },
      });
      if (activeRequest !== requestId.current) return;

      setStudents(response.data.data);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
      setTotalStudents(response.data.total);
      setError("");
    } catch {
      if (activeRequest === requestId.current) {
        setError("Unable to load students. Check your Laravel API server.");
      }
    } finally {
      if (activeRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => {
        void loadStudents(1, search);
      },
      search ? 300 : 0,
    );

    return () => window.clearTimeout(timeout);
  }, [loadStudents, search]);

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedPhoto(null);
    setCurrentPhotoUrl(null);
    setRemovePhoto(false);
    setFieldErrors({});
    setError("");
    setModalOpen(true);
  }

  function openEditModal(student: Student) {
    setEditingId(student.id);

    setForm({
      student_number: student.student_number,
      first_name: student.first_name,
      middle_name: student.middle_name ?? "",
      last_name: student.last_name,
      sex: student.sex,
      strand: student.strand ?? "",
      section: student.section ?? "",
      email: student.email ?? "",
      phone: student.phone ?? "",
      grade_level: student.grade_level,
      status: student.status,
    });

    setSelectedPhoto(null);
    setCurrentPhotoUrl(student.photo_url ?? null);
    setRemovePhoto(false);
    setFieldErrors({});
    setError("");
    setModalOpen(true);
  }

  function updateField(field: keyof StudentForm, value: string | number) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      const payload = {
        ...form,
        middle_name: form.middle_name || null,
        strand: form.grade_level >= 11 ? form.strand || null : null,
        section: form.section || null,
        email: form.email || null,
        phone: form.phone || null,
      };

      const payloadForm = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        payloadForm.append(key, value == null ? "" : String(value));
      });
      if (selectedPhoto) payloadForm.append("photo", selectedPhoto.file);

      if (editingId !== null) {
        payloadForm.append("_method", "PUT");
        payloadForm.append("remove_photo", removePhoto ? "1" : "0");
        await api.post(`/students/${editingId}`, payloadForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/students", payloadForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setModalOpen(false);
      setForm(emptyForm);
      setSelectedPhoto(null);
      setCurrentPhotoUrl(null);
      setRemovePhoto(false);
      setLoading(true);
      await loadStudents(currentPage, search);
    } catch (err: unknown) {
      if (
        axios.isAxiosError<ApiErrorPayload>(err) &&
        err.response?.status === 422
      ) {
        setFieldErrors(err.response.data.errors ?? {});
        setError("Please check the required fields.");
      } else {
        const message = axios.isAxiosError<ApiErrorPayload>(err)
          ? err.response?.data?.message
          : undefined;
        setError(
          message ??
            "Unable to save student. Please check your API and database.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(student: Student) {
    const confirmed = window.confirm(
      `Delete ${student.first_name} ${student.last_name}?`,
    );

    if (!confirmed) return;

    try {
      await api.delete(`/students/${student.id}`);
      const page =
        students.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;
      setLoading(true);
      await loadStudents(page, search);
    } catch {
      setError("Unable to delete student.");
    }
  }

  function inputClass() {
    return "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
  }

  function fieldError(field: string) {
    return fieldErrors[field]?.[0];
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Students
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage student records and personal information.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Students
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {students.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Active on this page
          </p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {students.filter((s) => s.status === "active").length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Grade Levels
          </p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">7–12</p>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={openAddModal}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add Student
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Student Records
          </h2>

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLoading(true);
            }}
            placeholder="Search students..."
            className={`${inputClass()} sm:max-w-xs`}
          />
        </div>

        {error && (
          <p className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-5 py-4">Student No.</th>
                <th className="px-5 py-4">Full Name</th>
                <th className="px-5 py-4">Grade</th>
                <th className="px-5 py-4">Section</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center">
                    Loading students...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900 dark:text-white">
                      {student.student_number}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-700 dark:text-slate-200">
                      <div className="flex items-center gap-3">
                        {student.photo_url ? (
                          <img
                            src={student.photo_url}
                            alt={`${student.first_name} ${student.last_name}`}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                          >
                            {student.first_name.charAt(0)}
                            {student.last_name.charAt(0)}
                          </span>
                        )}
                        <span>
                          {student.last_name}, {student.first_name}{" "}
                          {student.middle_name ?? ""}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">Grade {student.grade_level}</td>

                    <td className="px-5 py-4">{student.section || "—"}</td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          student.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <button
                        onClick={() => openEditModal(student)}
                        className="mr-3 font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => void deleteStudent(student)}
                        className="font-medium text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {students.length === 0 ? 0 : (currentPage - 1) * 10 + 1}–
            {(currentPage - 1) * 10 + students.length} of {totalStudents}{" "}
            students
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={loading || currentPage <= 1}
              onClick={() => {
                setLoading(true);
                void loadStudents(currentPage - 1, search);
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Previous
            </button>
            <span aria-live="polite">
              Page {currentPage} of {lastPage}
            </span>
            <button
              type="button"
              disabled={loading || currentPage >= lastPage}
              onClick={() => {
                setLoading(true);
                void loadStudents(currentPage + 1, search);
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingId !== null ? "Edit Student" : "Add Student"}
              </h2>

              <button
                onClick={() => setModalOpen(false)}
                className="text-2xl text-slate-500 hover:text-slate-900 dark:hover:text-white"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                  {error}
                </p>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">
                    Student Photo
                  </label>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                      {(selectedPhoto?.previewUrl ||
                        (removePhoto ? null : currentPhotoUrl)) && (
                        <img
                          src={
                            selectedPhoto?.previewUrl ??
                            (removePhoto ? undefined : currentPhotoUrl) ??
                            undefined
                          }
                          alt="Student photo preview"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        aria-label="Upload student photo"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setFieldErrors((previous) => ({
                            ...previous,
                            photo: [],
                          }));
                          if (file && file.size > 2 * 1024 * 1024) {
                            setFieldErrors((previous) => ({
                              ...previous,
                              photo: ["Photo must be 2 MB or smaller."],
                            }));
                            event.target.value = "";
                            setSelectedPhoto(null);
                            return;
                          }
                          setSelectedPhoto(
                            file
                              ? {
                                  file,
                                  previewUrl: URL.createObjectURL(file),
                                }
                              : null,
                          );
                          if (file) setRemovePhoto(false);
                        }}
                        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 dark:text-slate-300 dark:file:bg-indigo-950 dark:file:text-indigo-300"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        JPG, PNG, or WebP. Maximum file size: 2 MB.
                      </p>
                      {(currentPhotoUrl || selectedPhoto) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPhoto(null);
                            setRemovePhoto(true);
                          }}
                          className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          Remove photo
                        </button>
                      )}
                      {fieldError("photo") && (
                        <p className="text-xs text-red-500">
                          {fieldError("photo")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Student Number *
                  </label>
                  <input
                    required
                    value={form.student_number}
                    onChange={(e) =>
                      updateField("student_number", e.target.value)
                    }
                    className={inputClass()}
                    placeholder="2026-0001"
                  />
                  {fieldError("student_number") && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldError("student_number")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    First Name *
                  </label>
                  <input
                    required
                    value={form.first_name}
                    onChange={(e) => updateField("first_name", e.target.value)}
                    className={inputClass()}
                  />
                  {fieldError("first_name") && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldError("first_name")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Middle Name
                  </label>
                  <input
                    value={form.middle_name ?? ""}
                    onChange={(e) => updateField("middle_name", e.target.value)}
                    className={inputClass()}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Last Name *
                  </label>
                  <input
                    required
                    value={form.last_name}
                    onChange={(e) => updateField("last_name", e.target.value)}
                    className={inputClass()}
                  />
                  {fieldError("last_name") && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldError("last_name")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Sex *
                  </label>
                  <select
                    required
                    value={form.sex}
                    onChange={(e) => updateField("sex", e.target.value)}
                    className={inputClass()}
                  >
                    <option value="">Select sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Grade Level *
                  </label>
                  <select
                    required
                    value={form.grade_level}
                    onChange={(e) =>
                      updateField("grade_level", Number(e.target.value))
                    }
                    className={inputClass()}
                  >
                    {[7, 8, 9, 10, 11, 12].map((grade) => (
                      <option key={grade} value={grade}>
                        Grade {grade}
                      </option>
                    ))}
                  </select>
                </div>

                {form.grade_level >= 11 && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Strand
                    </label>
                    <select
                      value={form.strand ?? ""}
                      onChange={(e) => updateField("strand", e.target.value)}
                      className={inputClass()}
                    >
                      <option value="">Select strand</option>
                      <option value="STEM">STEM</option>
                      <option value="ABM">ABM</option>
                      <option value="HUMSS">HUMSS</option>
                      <option value="TVL">TVL</option>
                      <option value="GAS">GAS</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Section
                  </label>
                  <input
                    value={form.section ?? ""}
                    onChange={(e) => updateField("section", e.target.value)}
                    className={inputClass()}
                    placeholder="e.g. Rizal"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email ?? ""}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={inputClass()}
                  />
                  {fieldError("email") && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldError("email")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Phone
                  </label>
                  <input
                    value={form.phone ?? ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={inputClass()}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Status *
                  </label>
                  <select
                    required
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                    className={inputClass()}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium dark:border-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Update Student"
                      : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
