import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '../redux/messageSlice';

const useGetRealTimeMessages = () => {
  const { socket } = useSelector((state) => state.socket);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      dispatch(addMessage(newMessage));
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, dispatch]);
};

export default useGetRealTimeMessages;
