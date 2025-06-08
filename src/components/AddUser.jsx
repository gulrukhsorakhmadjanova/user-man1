import React, { useState } from "react";
import { Button, Label, TextInput, Alert } from "flowbite-react";
import { API_URL } from '../constants';

const UserForm = ({ onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password_hash: "",
    status: "active"
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate inputs
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password_hash) newErrors.password_hash = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const responseText = await response.text();

      if (!response.ok) {
        // Try parse JSON error message
        let errorMessage = responseText;
        try {
          const errJson = JSON.parse(responseText);
          errorMessage = errJson.details || errJson.error || responseText;
        } catch {}

        throw new Error(errorMessage);
      }

      const newUser = JSON.parse(responseText);
      onUserAdded(newUser);
      onClose();
    } catch (error) {
      console.error('API Error:', error);
      setErrors({ 
        general: error.message.includes('Unexpected token')
          ? "Server error - check console"
          : error.message 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <Alert color="failure" className="mb-4">
          {errors.general}
        </Alert>
      )}

      <div>
        <Label htmlFor="name" value="Full Name" />
        <TextInput
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          color={errors.name ? "failure" : "gray"}
          helperText={errors.name}
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
          color={errors.email ? "failure" : "gray"}
          helperText={errors.email}
          required
        />
      </div>

      <div>
        <Label htmlFor="password_hash" value="Password" />
        <TextInput
          id="password_hash"
          name="password_hash"
          type="password"
          value={formData.password_hash}
          onChange={handleChange}
          color={errors.password_hash ? "failure" : "gray"}
          helperText={errors.password_hash}
          required
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

      <div className="flex justify-end gap-2 pt-4">
        <Button 
          color="gray" 
          onClick={onClose}
          disabled={isSubmitting}
          type="button"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
