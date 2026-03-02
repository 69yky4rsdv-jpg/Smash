"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    document.cookie = "vs_userId=; path=/; max-age=0";
    document.cookie = "vs_role=; path=/; max-age=0";
    window.location.href = "/";
  }, []);

  return null;
}

