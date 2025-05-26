import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === "admin123") {
      localStorage.setItem("admin_auth", "admin123");
      navigate("/admin/kyc"); // ✅ redirect on successful login
    } else {
      setError("Incorrect admin password.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-center">Admin Login</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
