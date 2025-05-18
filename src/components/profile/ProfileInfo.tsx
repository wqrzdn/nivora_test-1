import { FC } from 'react';
import { Box, Typography, Divider, Avatar } from '@mui/material';
import { User } from '../../types/user';

interface ProfileInfoProps {
  user: User;
}

const ProfileInfo: FC<ProfileInfoProps> = ({ user }) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  
  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
        <Box sx={{ gridColumn: {xs: 'span 12', sm: 'span 4'}, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            {user.userType === 'owner' ? 'Property Owner' : user.userType === 'tenant' ? 'Property Seeker' : user.userType === 'service-provider' ? 'Service Provider' : 'User'}
          </Typography>
        </Box>
        
        <Box sx={{ gridColumn: {xs: 'span 12', sm: 'span 8'} }}>
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
            <Box sx={{ gridColumn: 'span 4' }}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 8' }}>
              <Typography variant="body1">
                {user.email}
              </Typography>
            </Box>
            
            <Box sx={{ gridColumn: 'span 4' }}>
              <Typography variant="body2" color="text.secondary">
                Phone
              </Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 8' }}>
              <Typography variant="body1">
                {user.phone || 'Not provided'}
              </Typography>
            </Box>
          </Box>
          
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
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileInfo;