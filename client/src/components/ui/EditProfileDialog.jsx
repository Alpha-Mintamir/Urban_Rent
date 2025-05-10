import { useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, PenSquare, Upload, Camera } from 'lucide-react';
import { useAuth } from '../../../hooks';
import { useLanguage } from '@/providers/LanguageProvider';

const EditProfileDialog = () => {
  const { user, setUser, uploadPicture, updateUser } = useAuth();
  const { t } = useLanguage();
  const uploadRef = useRef(null);
  const [picture, setPicture] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(user.picture || '');
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: user.name,
    password: '',
    confirm_password: '',
  });
  
  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setUserData(prev => ({
        ...prev,
        name: user.name
      }));
      if (user.picture) {
        setPreviewUrl(user.picture);
      }
    }
  }, [user]);

  const handleImageClick = () => {
    uploadRef.current.click();
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUserData = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    const { name, password, confirm_password } = userData;

    // Validation
    if (name.trim() === '') {
      setLoading(false);
      return toast.error("Name Can't be empty");
    } else if (password && password !== confirm_password) {
      setLoading(false);
      return toast.error("Passwords don't match");
    }

    try {
      // first check if picture has been updated or not
      let pictureUrl = null;
      if (picture) {
        // upload picture and save the image url
        try {
          pictureUrl = await uploadPicture(picture);
          console.log('Uploaded picture URL:', pictureUrl);
          if (!pictureUrl) {
            toast.error('Failed to upload profile picture');
          }
        } catch (uploadError) {
          console.error('Error uploading picture:', uploadError);
          toast.error('Failed to upload profile picture');
        }
      }

      const userDetails = {
        name: userData.name,
        password: userData.password || '',
        picture: pictureUrl, // This will be null if no picture was uploaded or if upload failed
      };

      console.log('Updating user with details:', { 
        name: userDetails.name,
        password: userDetails.password ? '********' : '',
        picture: userDetails.picture ? 'Picture URL exists' : 'No picture URL'
      });

      const res = await updateUser(userDetails);
      console.log('Update response:', res);
      
      if (res && res.success) {
        // Update the local user state with the new data
        setUser(res.user);
        // Update the preview URL to show the new profile picture
        if (pictureUrl) {
          setPreviewUrl(pictureUrl);
        }
        setLoading(false);
        toast.success('Profile updated successfully!');
        // Close the dialog after successful update
        setOpen(false);
      } else {
        setLoading(false);
        toast.error(res?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Something went wrong!');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-600 " onClick={() => setOpen(true)}>
          <PenSquare className="mr-2 h-4 w-4" />
          {t('editProfile')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">{t('editProfile')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative h-40 w-40 cursor-pointer overflow-hidden rounded-full bg-gray-200">
            <Avatar className="h-full w-full">
              <AvatarImage src={previewUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div
              className="absolute bottom-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#D746B7] text-white shadow-md hover:bg-[#c13da3]"
              onClick={handleImageClick}
            >
              <Camera size={18} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={uploadRef}
                onChange={handlePictureChange}
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">{t('uploadProfilePicture')}</p>
        </div>

        {/* Update form */}
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t('name')}
            </Label>
            <Input
              id="name"
              name="name"
              value={userData.name}
              className="col-span-3"
              onChange={handleUserData}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              {t('newPassword')}
            </Label>
            <Input
              id="password"
              name="password"
              value={userData.password}
              className="col-span-3"
              type="password"
              onChange={handleUserData}
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirm_password" className="text-right">
              {t('confirmPassword')}
            </Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              value={userData.confirm_password}
              className="col-span-3"
              type="password"
              placeholder="••••••••"
              onChange={handleUserData}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleSaveChanges}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
