import React, { useState } from "react";
import UserList from "./components/UserList";
import { Navbar, Footer } from "flowbite-react";
import Logo from "./assets/logo.svg";

const App = () => {
  const [users, setUsers] = useState([]);

  return (
    <>
      <Navbar fluid rounded className="bg-gray-100">
        <Navbar.Brand className="flex justify-between items-center">
          <img src={Logo} className="mr-1 h-12" alt="User Management React App" />
          <h1 className="text-3xl font-bold">User Management App</h1>
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar>

      <main className="container mx-auto mt-8">
        <UserList 
          users={users} 
          setUsers={setUsers}
        />
      </main>

      <Footer container className="container mx-auto">
        <div className="w-full">
          <Footer.Divider />
          <div className="w-full sm:flex sm:items-center sm:justify-between">
            <span className="text-sm text-gray-500 sm:text-center">
              © {new Date().getFullYear()} User Management App
            </span>
          </div>
        </div>
      </Footer>
    </>
  );
};

export default App;
