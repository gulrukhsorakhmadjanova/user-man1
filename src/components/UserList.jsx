import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import UserForm from "./AddUser";
import EditUserForm from "./EditUser";
import {
  TextInput,
  Button,
  Modal,
  Pagination,
  Table,
  Alert
} from "flowbite-react";
import {
  HiOutlineSearch,
  HiOutlinePlusCircle,
  HiOutlinePencilAlt,
  HiOutlineTrash
} from "react-icons/hi";
import { API_URL } from "../constants";

const UserList = ({ users, setUsers }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessageStatus, setAlertMessageStatus] = useState(false);
  const [alertMessageColor, setAlertMessageColor] = useState("success");
  const [editUserId, setEditUserId] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const updateTotalPages = (totalUsers) => {
    setTotalPages(Math.ceil(totalUsers / 5));
  };

  const fetchUsers = useCallback(async () => {
    try {
      const url = searchTerm
        ? `${API_URL}?search=${encodeURIComponent(searchTerm)}`
        : API_URL;

      const response = await axios.get(url);
      const sortedUsers = response.data.sort((a, b) => a.id - b.id);
      setUsers(sortedUsers);
      updateTotalPages(sortedUsers.length);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [searchTerm, setUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
    setCurrentPage(1);
  };

  const handleUserAdded = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
    setAlertMessage("User added successfully!");
    setAlertMessageColor("success");
    setAlertMessageStatus(true);
    setTimeout(() => setAlertMessageStatus(false), 3000);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    setAlertMessage("User updated successfully!");
    setAlertMessageColor("success");
    setAlertMessageStatus(true);
    setTimeout(() => setAlertMessageStatus(false), 3000);
  };

  const confirmDeleteUser = async () => {
    try {
      await axios.delete(`${API_URL}/${deleteUserId}`);
      await fetchUsers();
      setShowAlert(false);
      setAlertMessage("User deleted successfully!");
      setAlertMessageColor("warning");
      setAlertMessageStatus(true);
      setTimeout(() => setAlertMessageStatus(false), 3000);
    } catch (error) {
      console.error("Error deleting user:", error);
      setAlertMessage("Error deleting user");
      setAlertMessageColor("failure");
      setAlertMessageStatus(true);
      setTimeout(() => setAlertMessageStatus(false), 3000);
    }
  };

  const statusStyles = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
    blocked: "bg-gray-100 text-gray-800"
  };

  const formatStatus = (status) => {
    if (!status) return "Inactive";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      {alertMessageStatus && (
        <Alert color={alertMessageColor} className="mb-4" onDismiss={() => setAlertMessageStatus(false)}>
          {alertMessage}
        </Alert>
      )}

      <div className="flex justify-between items-center mb-3">
        <Button onClick={() => setOpenModal(true)}>
          <HiOutlinePlusCircle className="mr-2 h-5 w-5" />
          Add User
        </Button>

        <div className="flex items-center gap-2">
          <TextInput
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button color="gray" onClick={handleSearch}>
            <HiOutlineSearch className="mr-2 h-5 w-5" />
            Search
          </Button>
        </div>
      </div>

      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Add New User</Modal.Header>
        <Modal.Body>
          <UserForm
            onClose={() => setOpenModal(false)}
            onUserAdded={handleUserAdded}
          />
        </Modal.Body>
      </Modal>

      <div className="overflow-x-auto">
        <Table striped>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Registered</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {users
              .slice((currentPage - 1) * 5, currentPage * 5)
              .map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>{user.name || "N/A"}</Table.Cell>
                  <Table.Cell>{user.email || "N/A"}</Table.Cell>
                  <Table.Cell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        statusStyles[user.status?.toLowerCase()] || statusStyles.inactive
                      }`}
                    >
                      {formatStatus(user.status)}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    {user.registration_time
                      ? new Date(user.registration_time).toLocaleDateString()
                      : "N/A"}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button
                        color="purple"
                        size="xs"
                        onClick={() => {
                          setEditUserId(user.id);
                          setOpenEditModal(true);
                        }}
                      >
                        <HiOutlinePencilAlt />
                      </Button>
                      <Button
                        color="failure"
                        size="xs"
                        onClick={() => {
                          setDeleteUserId(user.id);
                          setShowAlert(true);
                        }}
                      >
                        <HiOutlineTrash />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      </div>

      <div className="flex justify-center mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal show={showAlert} onClose={() => setShowAlert(false)}>
        <Modal.Header>Confirm Deletion</Modal.Header>
        <Modal.Body>Are you sure you want to delete this user?</Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={confirmDeleteUser}>
            Yes
          </Button>
          <Button color="gray" onClick={() => setShowAlert(false)}>
            No
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Modal.Header>Edit User</Modal.Header>
        <Modal.Body>
          <EditUserForm
            userData={users.find((user) => user.id === editUserId)}
            onClose={() => setOpenEditModal(false)}
            onUserUpdated={handleUserUpdated}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

UserList.propTypes = {
  users: PropTypes.array.isRequired,
  setUsers: PropTypes.func.isRequired
};

export default UserList;