import * as React from 'react'
import {useEffect, useState} from 'react'
import * as Pieces from "@pieces.app/pieces-os-client";
import "./Copilot.css";

import Markdown from '../ResponseFormat/Markdown';
import { PiecesClient } from 'pieces-copilot-sdk';
// Replace 'your_base_url' with your actual base URL
export const BASE_URL = 'http://localhost:1000';
export const piecesClient = new PiecesClient({ baseUrl: BASE_URL });

let GlobalConversationID: string;

// going to use get all conversations with a few extra steps to store the current conversations locally.
export async function createNewConversation() {
  try {
    const newConversation = await piecesClient.createConversation({
      name: 'Hello World Conversation'
    });
    GlobalConversationID = newConversation.conversation.id;
  } catch (error) {
    console.error('An error occurred while creating a conversation:', error);
  }
}


// You can use this here to set and send a conversation message.
// function sendConversationMessage(prompt: string, conversationID: string = GlobalConversationID){
//   // 1. seed a message
//   // 2. get the conversation id from somewhere - likely the createNewConversation above ^^
//   // 3. send the new message over
//   // 4. use the message contents in the (not yet created) message stream/list
//   // console.log(prompt);
//   // console.log(conversationID);
//
//   askQuestion({query: prompt, relevant: ''}).then((r) => {
//     return r.result;
//   }).then((value) => {
//
//     // TODO: need to collect all of the iterable answers here for the viewer.
//     // TODO: i believe this is near the implementation of the stream.
//     // let _answers = value.answers.iterable;
//     // let's store the new answers globally for this file:
//     // GlobalConversationAnswers = [..._answers];
//   })
// }
export function CopilotChat(): React.JSX.Element {
  const [chatSelected, setChatSelected] = useState('no chat selected');
  const [chatInputData, setData] = useState('');
  const [message, setMessage] = useState<string>('');

  // handles the data changes on the chat input.
  const handleCopilotChatInputChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setData(event.target.value);
  };

  // handles the ask button click.
  const handleCopilotAskButtonClick = async (chatInputData) => {
    try {
      const { text } = await piecesClient.promptConversation({
        message: chatInputData,
        conversationId: GlobalConversationID
      });
      setMessage(text);
      setData("");
    } catch (error) {
      console.error('An error occurred while prompting the conversation:', error);
    }
  };
  
  // handles the new conversation button click.
  const handleNewConversation = async () => {
    createNewConversation();
    setMessage("")
    setData("")
  };

  // for setting the initial copilot chat that takes place on page load.
  useEffect(() => {
      const getInitialChat = async () => {
          try {
              const allConversations = await piecesClient.getConversations();
              // console.log('allConversations', allConversations);
              if (allConversations.length > 0) {
                  const { id, name } = allConversations[0];
                  GlobalConversationID = id;
                  setChatSelected(name);
              }
          } catch (error) {
              console.error('Error fetching conversations:', error);
          }
      };
      getInitialChat();
  }, []);

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Copilot Chat</h1>
          <button className="button" onClick={handleNewConversation}>Create Fresh Conversation</button>
        </div>
        <div className="footer">
          <button>back</button>
          <p>{chatSelected}</p>
          <button>forward</button>
        </div>
      </div>
      <div className="chat-box">
        <div className="text-area">
          <textarea placeholder="Type your prompt here..." value={chatInputData} onChange={handleCopilotChatInputChange}></textarea>
          <button onClick={() => handleCopilotAskButtonClick(chatInputData) }>Ask</button>
        </div>
        <div className="messages">
          <div>
          <Markdown message={message} />
          </div>
        </div>
      </div>
    </div>
  );
}