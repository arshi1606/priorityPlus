"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";
import Cookies from "js-cookie";

const SIGNUP_MUTATION = gql`
  mutation ($name: String!, $email: String!, $password: String!) {
    signUpUser(name: $name, email: $email, password: $password) {
      token
    }
  }
`;

export default function Signup() {
  const router = useRouter();

  const [signUpUser, { data, loading, error }] = useMutation(SIGNUP_MUTATION);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
  
      router.push("/protected/todo");
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {

      const response = await signUpUser({
        variables: {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          password: formData.get("password") as string,
        },
      });

      if (response.data?.signUpUser?.token) {
        console.log("Signup Success:", response.data);

       
        const token = response.data.signUpUser.token;
    
        Cookies.set('token', token);


      
        router.push("/protected/todo");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  required
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
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
                <input
                  type="password"
                  name="password"
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 text-white bg-black rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">Error: {error.message}</p>
              </div>
            )}

            {data && data.signUpUser?.token && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600">Account created successfully!</p>
              </div>
            )}
          </form>

          <h6 className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-medium text-black hover:underline">
              Sign in
            </Link>
          </h6>
        </div>
      </div>
    </div>
  );
}
