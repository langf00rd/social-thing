"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";
import Image from "next/image";
import { useState } from "react";
import Balancer from "react-wrap-balancer";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex items-center flex-col gap-8">
        <h2 className="text-3xl md:text-5xl font-medium max-w-100 md:leading-13 text-center">
          <Balancer>Create your free account</Balancer>
        </h2>
        <Button
          size="lg"
          variant="secondary"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <Image
            width="18"
            height="18"
            src="https://img.icons8.com/external-tal-revivo-color-tal-revivo/24/external-google-an-american-multinational-technology-company-that-specializes-in-internet-related-services-and-products-logo-color-tal-revivo.png"
            alt="Google"
          />
          Continue with Google
        </Button>
        <small className="max-w-[300px] text-neutral-500 text-center">
          <Balancer>
            By using this app, you agree to our{" "}
            <span className="font-semibold">Terms of Service</span> and{" "}
            <span className="font-semibold">Privacy Policy</span>.
          </Balancer>
        </small>
      </div>
    </div>
  );
}
