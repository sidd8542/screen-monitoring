import { FC, ReactNode, useState } from "react";
import { FiPlus, FiMove } from "react-icons/fi";

// Button Component
const Button = ({ children, className = "", variant = "outline", size = "md", disabled = false }) => {
  const baseStyle = "inline-flex items-center px-4 py-2 border rounded focus:outline-none";
  const variantStyle = variant === "outline" ? "border-gray-300 bg-white text-gray-700" : "bg-transparent text-gray-700";
  const sizeStyle = size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";
  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100";
  
  return (
    <button
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${disabledStyle} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Badge Component
const Badge: FC<{ children: ReactNode; variant?: "outline"; className?: string }> = ({
  children,
  variant = "outline",
  className = "",
}) => {
  const baseStyle = "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full";
  const variantStyle = variant === "outline" ? "border border-gray-300 bg-white text-gray-700" : "bg-gray-100 text-gray-800";
  
  return (
    <span className={`${baseStyle} ${variantStyle} ${className}`}>
      {children}
    </span>
  );
};

// Table Components
const Table: FC<{ children: ReactNode }> = ({ children }) => (
  <table className="min-w-full">{children}</table>
);

const TableHeader: FC<{ children: ReactNode }> = ({ children }) => (
  <thead>{children}</thead>
);

const TableRow: FC<{ children: ReactNode }> = ({ children }) => (
  <tr>{children}</tr>
);

const TableHead: FC<{ children: ReactNode }> = ({ children }) => (
  <th className="px-4 py-2 border-b">{children}</th>
);

const TableBody: FC<{ children: ReactNode }> = ({ children }) => (
  <tbody>{children}</tbody>
);

const TableCell: FC<{ children: ReactNode }> = ({ children }) => (
  <td className="px-4 py-2 border-b">{children}</td>
);

// Card Components
const Card: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="bg-white shadow rounded-lg">{children}</div>
);

const CardHeader: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="px-4 py-2 border-b">{children}</div>
);

const CardTitle: FC<{ children: ReactNode }> = ({ children }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

const CardContent: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="px-4 py-2">{children}</div>
);

// Main Component
interface Session {
  sessionId: string;
  status: "active" | "closed" | "pending";
}

const Component = (props) => {
    const {sessionss, onItemClick} = props
    console.log(sessionss);
    
    const [sessions, setSessions] = useState<any>([])
    setSessions(sessionss)

    const handleClick = (item) =>{
        onItemClick(item)
    }
  return (
    <div className="flex flex-col border mt-10 h-full">
      <header className="border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Session Management</h1>
        {/* <Button className="flex items-center gap-2" variant="outline">
          <FiPlus className="w-4 h-4" />
          Create New Session
        </Button> */}
      </header>
      <main className="flex-1 overflow-auto border p-4">
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.sessionId}>
                      <TableCell>
                        <div className="font-medium">{session.sessionId}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            session.status === "active"
                              ? "bg-green-100 text-green-600"
                              : session.status === "closed"
                              ? "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-600"
                          }
                        >
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2" onClick={() => handleClick(session.sessionId)}>
                          <Button variant="outline" size="sm">
                            Join
                          </Button>
                          {/* <Button variant="ghost" size="sm">
                            <FiMove className="w-4 h-4" />
                          </Button> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Component;
