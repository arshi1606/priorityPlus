"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import "./style/index.css";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/protected/todo");
    }
  }, [router]);

  return (
    <div className="container">
      <div className="leftSection">
        <div className="imageContainer">
          <Image
            src="/index.svg"
            alt="Priority Plus Logo"
            width={300}
            height={300}
            className="image"
          />
        </div>
      </div>

      <div className="rightSection">
        <h1 className="appName">Priority Plus</h1>
        <p className="introductionText">
          Managing tasks has never been easier. With Priority Plus, you can organize and prioritize your work seamlessly, so nothing gets missed.
        </p>
        <div className="buttonContainer">
          <Link href="/auth/signup">
            <button className="getStartedButton">Get Started</button>
          </Link>
         
        </div>
      </div>
    </div>
  );
}
