const messageActions = {
    sendMessage: (socket, message) => {
      socket.emit('newMessage', message);
    },
    handleNewMessage: (messages, newMessage) => {
      return [...messages, newMessage];
    }
  };
  
  export default messageActions;
  