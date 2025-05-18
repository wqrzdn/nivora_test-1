import React from 'react';
import { Box, Grid, Typography, Divider, Avatar } from '@mui/material';
import { User } from '../../types/user';

interface ProfileInfoProps {
  user: User;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            sx={{ width: 150, height: 150, mb: 2 }}
            src={user.avatarUrl}
            alt={fullName}
          >
            {user.firstName.charAt(0)}
          </Avatar>
          <Typography variant="h6" gutterBottom>
            {fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.userType === 'owner' ? 'Property Owner' : 'Property Seeker'}
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={8}>
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body1">
                {user.email}
              </Typography>
            </Grid>
            
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">
                Phone
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body1">
                {user.phone || 'Not provided'}
              </Typography>
            </Grid>
          </Grid>
          
          {user.bio && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                About Me
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">
                {user.bio}
              </Typography>
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileInfo; 