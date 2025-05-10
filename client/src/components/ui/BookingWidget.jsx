import { useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axios';

const BookingWidget = () => {
  const [messageData, setMessageData] = useState({
    phone: '',
    message: '',
  });

  const { phone, message } = messageData;

  // Handle message form data
  const handleMessageData = (e) => {
    const { name, value } = e.target;
    setMessageData({
      ...messageData,
      [name]: value,
    });
  };

  const handleSendMessage = async () => {
    // MESSAGE DATA VALIDATION
    if (phone.trim() === '') {
      return toast.error('የስልክ ቁጥር አይታወቅም');
    } else if (message.trim() === '') {
      return toast.error('መልእክት አይታወቅም');
    }

    try {
      const response = await axiosInstance.post('/messages', {
        phone,
        message,
      });

      toast('መልእክት ተልኳል!');
      setMessageData({ phone: '', message: '' }); // Clear the form after sending
    } catch (error) {
      toast.error('አንድ ነገር ተሳስቷል!');
      console.log('Error: ', error);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-xl">
      <h2 className="text-center text-xl">መልእክት ላክ</h2>
      <div className="mt-4 rounded-2xl border">
        <div className="border-t px-4 py-3">
          <label>የስልክ ቁጥር: </label>
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={handleMessageData}
            placeholder="የስልክዎን ቁጥር ይግቡ"
            required
          />
        </div>
        <div className="border-t px-4 py-3">
          <label>መልእክት: </label>
          <textarea
            name="message"
            value={message}
            onChange={handleMessageData}
            placeholder="እባኮትን መልእክትዎን ይጻፉ"
            rows="4"
            required
          />
        </div>
      </div>
      <button onClick={handleSendMessage} className="primary mt-4">
        መልእክት ላክ
      </button>
    </div>
  );
};

export default BookingWidget;
