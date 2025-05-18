import { useState } from 'react';
import { Box, Button, TextField, MenuItem } from '@mui/material';
import { User } from '../../types/user';

interface EditProfileFormProps {
  user: User;
  onSave: (userData: User) => void;
  onCancel: () => void;
}

const EditProfileForm = ({ user, onSave, onCancel }: EditProfileFormProps) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: user.bio || '',
    userType: user.userType || 'tenant',
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    // Phone validation (optional field but must be valid if provided)
    if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSave({
        ...user,
        ...formData
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
        <Box sx={{ gridColumn: {xs: 'span 12', sm: 'span 6'} }}>
          <TextField
            required
            fullWidth
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
          />
        </Box>
        <Box sx={{ gridColumn: {xs: 'span 12', sm: 'span 6'} }}>
          <TextField
            required
            fullWidth
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
          />
        </Box>
        <Box sx={{ gridColumn: 'span 12' }}>
          <TextField
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
        </Box>
        <Box sx={{ gridColumn: 'span 12' }}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={!!errors.phone}
            helperText={errors.phone}
          />
        </Box>
        <Box sx={{ gridColumn: 'span 12' }}>
          <TextField
            select
            fullWidth
            label="Account Type"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
          >
            <MenuItem value="tenant">Property Seeker</MenuItem>
            <MenuItem value="owner">Property Owner</MenuItem>
            <MenuItem value="service-provider">Service Provider</MenuItem>
          </TextField>
        </Box>
        <Box sx={{ gridColumn: 'span 12' }}>
          <TextField
            fullWidth
            label="Bio"
            name="bio"
            multiline
            rows={4}
            value={formData.bio}
            onChange={handleChange}
          />
        </Box>
        <Box sx={{ gridColumn: 'span 12' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EditProfileForm;