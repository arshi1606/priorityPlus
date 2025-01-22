"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Cookies from "js-cookie"


const SIGNIN_MUTATION = gql`
  mutation ($email: String!, $password: String!) {
    signInUser(email: $email, password: $password) {
      token
    }
  }
`;

export default function Signin() {
  const router = useRouter();
  const [signInUser, { loading, error }] = useMutation(SIGNIN_MUTATION);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.push("/protected/todo");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const { data } = await signInUser({
        variables: {
          email: formData.email,
          password: formData.password,
        },
      });

      if (data?.signInUser?.token) {
        const token = data.signInUser.token;
       
        Cookies.set('token', token);

        router.push("/protected/todo");
      }
    } catch (err) {
      console.error("Signin Error:", err);
      alert("Signin failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  required
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 text-white bg-black rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">Error: {error.message}</p>
              </div>
            )}

            <h6 className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <p className="font-medium text-black hover:underline">
                <Link href="/auth/signup">Create one</Link>
              </p>
            </h6>
          </form>
        </div>
      </div>
    </div>
  );
}
