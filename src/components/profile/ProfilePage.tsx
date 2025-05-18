import React, { useState } from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import ProfileInfo from './ProfileInfo';
import EditProfileForm from './EditProfileForm';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types/user';

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // If no user is logged in, show a message
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5">
            Please log in to view your profile
          </Typography>
        </Paper>
      </Container>
    );
  }

  const handleSave = async (updatedUser: User) => {
    try {
      await updateUserProfile({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        bio: updatedUser.bio
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Handle error (could add an error state and display it)
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">My Profile</Typography>
          {!isEditing && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        {isEditing ? (
          <EditProfileForm 
            user={user} 
            onCancel={() => setIsEditing(false)} 
            onSave={handleSave}
          />
        ) : (
          <ProfileInfo user={user} />
        )}
      </Paper>
    </Container>
  );
};

export default ProfilePage; 