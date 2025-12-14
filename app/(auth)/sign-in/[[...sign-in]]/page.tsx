import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50/80 to-blue-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-blue-950/20">
      <SignIn />
    </div>
  );
}
