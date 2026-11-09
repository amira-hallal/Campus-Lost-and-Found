import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 6;

const EMPTY_FORM = { name: "", email: "", password: "", confirmPassword: "", role: "" };

const ROLES = [
  { value: "student", label: "Student" },
  { value: "staff", label: "Staff" },
  { value: "faculty", label: "Faculty" },
];

export default function Register() {
  const { register, emailExists } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.title = "Register | Campus Lost & Found";
  }, []);

  const validate = () => {
    const found = {};

    if (!form.name.trim()) found.name = "Name is required.";

    if (!form.email.trim()) found.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(form.email.trim())) found.email = "Enter a valid email, like name@lau.edu.";
    else if (emailExists(form.email)) found.email = "An account with this email already exists.";

    if (!form.password) found.password = "Password is required.";
    else if (form.password.length < PASSWORD_MIN)
      found.password = `Password must be at least ${PASSWORD_MIN} characters.`;

    if (!form.confirmPassword) found.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) found.confirmPassword = "Passwords do not match.";

    return found;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear a field's error as soon as the user edits it
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);

    const firstError = Object.keys(found)[0];
    if (firstError) {
      document.getElementById(firstError)?.focus();
      return;
    }

    register(form); // adds the user to the users array and logs them in
    navigate(location.state?.from ?? "/", { replace: true });
  };

  // One text field with its label and error message
  const renderField = (name, label, type, autoComplete, hint) => {
    const errorId = `${name}-error`;
    const hintId = `${name}-hint`;
    const describedBy = [errors[name] && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

    return (
      <div>
        <label htmlFor={name} className="form-label">
          {label}
        </label>
        <input
          id={name}
          name={name}
          type={type}
          autoComplete={autoComplete}
          value={form[name]}
          onChange={handleChange}
          aria-invalid={errors[name] ? true : undefined}
          aria-describedby={describedBy}
          className="form-input"
        />
        {hint && !errors[name] && (
          <p id={hintId} className="mt-1.5 text-xs text-muted dark:text-stone-400">
            {hint}
          </p>
        )}
        {errors[name] && (
          <p id={errorId} className="form-error">
            {errors[name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <div className="card p-6 shadow-sm sm:p-8">
        <div className="mb-4 inline-flex rounded-full bg-brand-100 p-3 text-brand-800 dark:bg-brand-500/15 dark:text-brand-300">
          <UserPlus className="size-6" aria-hidden="true" />
        </div>
        <h1 className="display text-3xl">Create an account</h1>
        <p className="mt-2 text-sm">Join M.A.R.S Campus Lost &amp; Found to report and claim items.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          {renderField("name", "Full name", "text", "name")}
          {renderField("email", "Email", "email", "email")}
          {renderField("password", "Password", "password", "new-password", `At least ${PASSWORD_MIN} characters.`)}
          {renderField("confirmPassword", "Confirm password", "password", "new-password")}

          <div>
            <label htmlFor="role" className="form-label">
              Role <span className="font-normal text-muted dark:text-stone-400">(optional)</span>
            </label>
            <select id="role" name="role" value={form.role} onChange={handleChange} className="form-input">
              <option value="">Select a role</option>
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary w-full">
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-800 hover:underline dark:text-brand-300">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
