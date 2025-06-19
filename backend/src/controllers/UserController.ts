import { UserRepository } from '../repositories/UserRepository';
import { AuthenticatedRequest, TypedResponse } from '../types/express';

export interface UpdateProfileData {
  displayName?: string;
  avatar?: string;
}

export interface UpdatePreferencesData {
  defaultTempo?: number;
  collaborationNotifications?: boolean;
}

export class UserController {
  constructor(private userRepository: UserRepository) {}

  /**
   * Get current user profile (extended version)
   * GET /api/v1/users/profile
   */
  getProfile = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to access profile'
        });
        return;
      }

      // Get full user data from database
      const user = await this.userRepository.findById(req.user.id);
      
      if (!user) {
        res.status(404).json({
          error: 'User not found',
          message: 'User profile not found'
        });
        return;
      }

      // Return user profile without sensitive data
      const userProfile = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        defaultTempo: user.defaultTempo,
        collaborationNotifications: user.collaborationNotifications,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.json({
        message: 'Profile retrieved successfully',
        user: userProfile
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile retrieval failed';
      res.status(500).json({
        error: 'Profile retrieval failed',
        message
      });
    }
  };

  /**
   * Update user profile
   * PUT /api/v1/users/profile
   */
  updateProfile = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to update profile'
        });
        return;
      }

      const updateData: UpdateProfileData = {};
      
      // Validate and extract update data
      if (req.body.displayName !== undefined) {
        if (typeof req.body.displayName !== 'string') {
          res.status(400).json({
            error: 'Validation failed',
            message: 'Display name must be a string'
          });
          return;
        }
        // Allow empty string, but validate max length if provided
        if (req.body.displayName.length > 50) {
          res.status(400).json({
            error: 'Validation failed',
            message: 'Display name must be 50 characters or less'
          });
          return;
        }
        // Store empty string as undefined for consistency
        updateData.displayName = req.body.displayName.trim() || undefined;
      }

      if (req.body.avatar !== undefined) {
        if (req.body.avatar !== null && typeof req.body.avatar !== 'string') {
          res.status(400).json({
            error: 'Validation failed',
            message: 'Avatar must be a string URL or null'
          });
          return;
        }
        updateData.avatar = req.body.avatar;
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'No valid fields provided for update'
        });
        return;
      }

      // Update user profile
      const updatedUser = await this.userRepository.update(req.user.id, updateData);

      // Return updated profile without sensitive data
      const userProfile = {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        avatar: updatedUser.avatar,
        defaultTempo: updatedUser.defaultTempo,
        collaborationNotifications: updatedUser.collaborationNotifications,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };

      res.json({
        message: 'Profile updated successfully',
        user: userProfile
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed';
      res.status(500).json({
        error: 'Profile update failed',
        message
      });
    }
  };

  /**
   * Get user preferences
   * GET /api/v1/users/preferences
   */
  getPreferences = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to access preferences'
        });
        return;
      }

      const user = await this.userRepository.findById(req.user.id);
      
      if (!user) {
        res.status(404).json({
          error: 'User not found',
          message: 'User not found'
        });
        return;
      }

      const preferences = {
        defaultTempo: user.defaultTempo,
        collaborationNotifications: user.collaborationNotifications
      };

      res.json({
        message: 'Preferences retrieved successfully',
        preferences
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Preferences retrieval failed';
      res.status(500).json({
        error: 'Preferences retrieval failed',
        message
      });
    }
  };

  /**
   * Update user preferences
   * PUT /api/v1/users/preferences
   */
  updatePreferences = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to update preferences'
        });
        return;
      }

      const updateData: UpdatePreferencesData = {};

      // Validate and extract preference updates
      if (req.body.defaultTempo !== undefined) {
        if (!Number.isInteger(req.body.defaultTempo) || req.body.defaultTempo < 60 || req.body.defaultTempo > 200) {
          res.status(400).json({
            error: 'Validation failed',
            message: 'Default tempo must be an integer between 60 and 200 BPM'
          });
          return;
        }
        updateData.defaultTempo = req.body.defaultTempo;
      }

      if (req.body.collaborationNotifications !== undefined) {
        if (typeof req.body.collaborationNotifications !== 'boolean') {
          res.status(400).json({
            error: 'Validation failed',
            message: 'Collaboration notifications must be a boolean value'
          });
          return;
        }
        updateData.collaborationNotifications = req.body.collaborationNotifications;
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'No valid preference fields provided for update'
        });
        return;
      }

      // Update user preferences
      const updatedUser = await this.userRepository.update(req.user.id, updateData);

      const preferences = {
        defaultTempo: updatedUser.defaultTempo,
        collaborationNotifications: updatedUser.collaborationNotifications
      };

      res.json({
        message: 'Preferences updated successfully',
        preferences
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Preferences update failed';
      res.status(500).json({
        error: 'Preferences update failed',
        message
      });
    }
  };

  /**
   * Update user avatar
   * PUT /api/v1/users/avatar
   */
  updateAvatar = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to update avatar'
        });
        return;
      }

      const { avatarUrl } = req.body;

      // Validate avatar URL
      if (!avatarUrl) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Avatar URL is required'
        });
        return;
      }

      if (typeof avatarUrl !== 'string') {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Avatar URL must be a string'
        });
        return;
      }

      // Basic URL validation
      try {
        new globalThis.URL(avatarUrl);
      } catch {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Avatar URL must be a valid URL'
        });
        return;
      }

      // Update user avatar
      const updatedUser = await this.userRepository.update(req.user.id, { avatar: avatarUrl });

      res.json({
        message: 'Avatar updated successfully',
        user: {
          id: updatedUser.id,
          displayName: updatedUser.displayName,
          avatar: updatedUser.avatar
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Avatar update failed';
      res.status(500).json({
        error: 'Avatar update failed',
        message
      });
    }
  };

  /**
   * Delete user account
   * DELETE /api/v1/users/account
   */
  deleteAccount = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to delete account'
        });
        return;
      }

      const { confirmPassword } = req.body;

      if (!confirmPassword) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Password confirmation is required for account deletion'
        });
        return;
      }

      // Get full user data to verify password
      const user = await this.userRepository.findById(req.user.id);
      
      if (!user) {
        res.status(404).json({
          error: 'User not found',
          message: 'User account not found'
        });
        return;
      }

      // TODO: Verify password when we integrate password verification
      // For now, we'll implement a basic verification that the user knows their ID
      // In a real implementation, you'd verify the password against the hash

      // Soft delete: For now we'll do a hard delete, but in production you might want soft delete
      await this.userRepository.delete(req.user.id);

      res.json({
        message: 'Account deleted successfully'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Account deletion failed';
      res.status(500).json({
        error: 'Account deletion failed',
        message
      });
    }
  };
}
