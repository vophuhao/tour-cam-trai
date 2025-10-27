"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { sendPasswordResetEmail } from "@/lib/api";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");

  const mutation = useMutation<any, Error, string>({
    mutationFn: sendPasswordResetEmail,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      mutation.mutate(email);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white border rounded-lg shadow-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
            alt="Logo"
            className="h-12"
          />
        </div>

        <h2 className="text-xl font-semibold text-center mb-4">
          Trouble logging in?
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email and we’ll send you a link to get back into your account.
        </p>

        {mutation.isError && (
          <p className="text-red-500 text-sm mb-3">
            {mutation.error?.message || "An error occurred"}
          </p>
        )}

        {mutation.isSuccess ? (
          <div className="p-3 mb-4 text-sm text-green-600 bg-green-100 rounded-md">
            Email sent! Check your inbox for further instructions.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400 mb-4"
              required
            />
            <button
              type="submit"
              disabled={!email || mutation.isLoading}
              className="w-full py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {mutation.isLoading ? "Sending..." : "Send login link"}
            </button>
          </form>
        )}

        <div className="flex justify-center mt-6">
          <Link
            href="/login"
            className="text-blue-500 text-sm font-medium hover:underline"
          >
            Back to Login
          </Link>
        </div>

        <div className="border-t mt-6 pt-4 text-center">
          <p className="text-sm">
            Don’t have an account?{" "}
            <Link href="/register" className="font-medium text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
