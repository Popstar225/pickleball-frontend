import { Users, Building2, MapPin, Trophy, ShieldCheck, UserPlus, MessageSquare, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { dashboardStats } from "@/data/dashboardMockData";

// const stats = [
//   { label: "Jugadores", value: dashboardStats.totalPlayers, icon: Users, color: "text-primary" },
//   { label: "Clubes", value: dashboardStats.totalClubs, icon: Building2, color: "text-blue-500" },
//   { label: "Estados", value: dashboardStats.totalStates, icon: MapPin, color: "text-orange-500" },
//   { label: "Entrenadores", value: dashboardStats.totalCoaches, icon: GraduationCap, color: "text-purple-500" },
//   { label: "Torneos Activos", value: dashboardStats.activeTournaments, icon: Trophy, color: "text-yellow-500" },
//   { label: "Verificaciones Pendientes", value: dashboardStats.pendingVerifications, icon: ShieldCheck, color: "text-red-500" },
//   { label: "Nuevos Registros (30d)", value: dashboardStats.newRegistrations, icon: UserPlus, color: "text-emerald-500" },
//   { label: "Mensajes Enviados", value: dashboardStats.totalMessages, icon: MessageSquare, color: "text-cyan-500" },
// ];

export default function DashboardHome() {
  return (
    // <div className="space-y-6">
    //   <div>
    //     <h2 className="text-3xl font-bold tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
    //       Panel de Control
    //     </h2>
    //     <p className="text-muted-foreground text-sm mt-1">
    //       Resumen general de la Federación Mexicana de Pickleball
    //     </p>
    //   </div>

    //   <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
    //     {stats.map((stat) => (
    //       <Card key={stat.label} className="card-hover">
    //         <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
    //           <CardTitle className="text-sm font-medium text-muted-foreground">
    //             {stat.label}
    //           </CardTitle>
    //           <stat.icon className={`h-5 w-5 ${stat.color}`} />
    //         </CardHeader>
    //         <CardContent>
    //           <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
    //         </CardContent>
    //       </Card>
    //     ))}
    //   </div>

    //   {/* Recent activity placeholder */}
    //   <div className="grid gap-4 lg:grid-cols-2">
    //     <Card>
    //       <CardHeader>
    //         <CardTitle className="text-lg">Registros Recientes</CardTitle>
    //       </CardHeader>
    //       <CardContent>
    //         <div className="space-y-3">
    //           {[
    //             { name: "Carlos García", type: "Jugador", time: "Hace 2 horas" },
    //             { name: "Club Pickleball Mérida", type: "Club", time: "Hace 5 horas" },
    //             { name: "Ana Martínez", type: "Jugador", time: "Hace 1 día" },
    //             { name: "Asociación Jalisco", type: "Estado", time: "Hace 2 días" },
    //           ].map((item, i) => (
    //             <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
    //               <div>
    //                 <p className="text-sm font-medium">{item.name}</p>
    //                 <p className="text-xs text-muted-foreground">{item.type}</p>
    //               </div>
    //               <span className="text-xs text-muted-foreground">{item.time}</span>
    //             </div>
    //           ))}
    //         </div>
    //       </CardContent>
    //     </Card>

    //     <Card>
    //       <CardHeader>
    //         <CardTitle className="text-lg">Verificaciones Pendientes</CardTitle>
    //       </CardHeader>
    //       <CardContent>
    //         <div className="space-y-3">
    //           {[
    //             { name: "Roberto Díaz", type: "Jugador", status: "Documento pendiente" },
    //             { name: "Puebla Pickleball", type: "Club", status: "RFC pendiente" },
    //             { name: "Valentina Cruz", type: "Entrenador", status: "Certificación pendiente" },
    //             { name: "Asociación Sonora", type: "Estado", status: "Documentos pendientes" },
    //           ].map((item, i) => (
    //             <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
    //               <div>
    //                 <p className="text-sm font-medium">{item.name}</p>
    //                 <p className="text-xs text-muted-foreground">{item.type}</p>
    //               </div>
    //               <span className="text-xs text-destructive font-medium">{item.status}</span>
    //             </div>
    //           ))}
    //         </div>
    //       </CardContent>
    //     </Card>
    //   </div>
    // </div>
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
