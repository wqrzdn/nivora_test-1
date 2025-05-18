import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Box, Button, Container, Paper, Typography, CircularProgress } from '@mui/material';
import EditProfileForm from './EditProfileForm';
import ProfileInfo from './ProfileInfo';

const Profile = () => {
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5" align="center">
            Please log in to view your profile
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
          <Box sx={{ gridColumn: 'span 12', display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
          
          <Box sx={{ gridColumn: {xs: 'span 12', md: 'span 4'}, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Avatar
              src={user.avatarUrl || undefined}
              alt={`${user.firstName} ${user.lastName}`}
              sx={{ width: 150, height: 150, mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user.userType === 'owner' ? 'Property Owner' : user.userType === 'tenant' ? 'Property Seeker' : user.userType === 'service-provider' ? 'Service Provider' : 'User'}
            </Typography>
          </Box>
          
          <Box sx={{ gridColumn: {xs: 'span 12', md: 'span 8'} }}>
            {isEditing ? (
              <EditProfileForm 
                user={user} 
                onCancel={() => setIsEditing(false)} 
                onSave={() => setIsEditing(false)}
              />
            ) : (
              <ProfileInfo user={user} />
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 