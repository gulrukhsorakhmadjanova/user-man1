import React, { useState } from "react";
import { Button, Label, TextInput, Alert } from "flowbite-react";
import { API_URL } from "../constants";

const EditUserForm = ({ userData, onClose, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    name: userData.name || "",
    email: userData.email || "",
    password_hash: "", // Optional, only send if user enters a new password
    status: userData.status || "active",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare the data to send
      const updateData = {
        name: formData.name,
        email: formData.email,
        status: formData.status
      };
      
      // Only include password if it was changed
      if (formData.password_hash) {
        updateData.password_hash = formData.password_hash;
      }

      const response = await fetch(`${API_URL}/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Update failed');
      }
  
      const updatedUser = await response.json();
      onUserUpdated(updatedUser);
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      setErrors({ general: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && <Alert color="failure">{errors.general}</Alert>}

      <div>
        <Label htmlFor="name" value="Name" />
        <TextInput
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="email" value="Email" />
        <TextInput
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="password_hash" value="New Password (leave blank to keep current)" />
        <TextInput
          id="password_hash"
          name="password_hash"
          type="password"
          value={formData.password_hash}
          onChange={handleChange}
          placeholder="••••••••"
        />
      </div>

      <div>
        <Label htmlFor="status" value="Status" />
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" color="gray" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update User'}
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;