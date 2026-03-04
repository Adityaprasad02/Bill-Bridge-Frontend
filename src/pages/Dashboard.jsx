import { useEffect, useState } from "react";
import { getMe } from "@/features/auth/authService";
import  useAuthStore  from "../features/auth/authStore.js"; 


export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
   const accessToken = useAuthStore((s) => s.accessToken);

   //console.log("Acceaa token :" , accessToken) ;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMe();
        setMe(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  return (
  <div>
    Dashboard 
    {me?.id ? `- User ID: ${me.id}` : ""}
    {me?.username ? `- Welcome: ${me.username}` : ""}
    {me?.email ? `Email: (${me.email})` : ""}
    {me?.role ? `- Role: ${me.role}` : ""}
    {me?.authProvider ? `- Auth Provider: ${me.authProvider}` : ""  }

    </div>
  );
}