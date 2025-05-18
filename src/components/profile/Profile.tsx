import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Box, Button, Container, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import EditProfileForm from './EditProfileForm';
import ProfileInfo from './ProfileInfo';

const Profile = () => {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
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
        <Grid container spacing={3}>
          <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
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
          </Grid>
          
          <Grid item xs={12} md={4} display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={user.avatarUrl || undefined}
              alt={`${user.firstName} ${user.lastName}`}
              sx={{ width: 150, height: 150, mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user.userType === 'agent' ? 'Real Estate Agent' : 'Property Seeker'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={8}>
            {isEditing ? (
              <EditProfileForm 
                user={user} 
                onCancel={() => setIsEditing(false)} 
                onSaved={() => setIsEditing(false)}
              />
            ) : (
              <ProfileInfo user={user} />
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile; 