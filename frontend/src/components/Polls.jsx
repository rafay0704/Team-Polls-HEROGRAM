import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Polls = ({ token }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('');
  const [polls, setPolls] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [wsConnections, setWsConnections] = useState({});

  // WebSocket Setup to listen for tally updates
  const setupWebSocket = (pollId) => {
    const existingWs = wsConnections[pollId];
    if (existingWs) {
      return; // Avoid reopening WebSocket if it's already open
    }

    

const ws = new WebSocket(`ws://localhost:3000/poll/${pollId}`);

    ws.onmessage = (event) => {
      const updatedTally = JSON.parse(event.data);
      setPolls((prevPolls) =>
        prevPolls.map((poll) =>
          poll.id === pollId
            ? { ...poll, tally: updatedTally }
            : poll
        )
      );
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      // Remove WebSocket from connections once it's closed
      setWsConnections((prevWs) => {
        const updatedWs = { ...prevWs };
        delete updatedWs[pollId];
        return updatedWs;
      });
    };

    setWsConnections((prevWs) => ({
      ...prevWs,
      [pollId]: ws
    }));
  };

  const fetchPolls = async () => {
    try {
      const response = await api.get('/poll');
      setPolls(response.data);

      // Setup WebSocket for each poll to listen for real-time updates
      response.data.forEach((poll) => setupWebSocket(poll.id));
    } catch (err) {
      console.error('Error fetching polls:', err);
    }
  };

  const handleCreatePoll = async () => {
    if (!question || !options) {
      setError('Please fill out both question and options.');
      return;
    }

    try {
      const response = await api.post(
        '/poll',
        {
          question,
          options: options.split(',').map((o) => o.trim()),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess('Poll created successfully!');
      setQuestion('');
      setOptions('');
      fetchPolls(); // refetch polls after creating
    } catch (error) {
      console.error('Error creating poll:', error);
      setError('Failed to create poll. Please try again.');
    }
  };

  const handleVote = async (pollId, option) => {
  console.log('Token:', token); // Ensure token is valid
  try {
    // Optimistically update the vote count in the local state
    setPolls((prevPolls) =>
      prevPolls.map((poll) =>
        poll.id === pollId
          ? {
              ...poll,
              tally: {
                ...poll.tally,
                [option]: (poll.tally[option] || 0) + 1,
              },
            }
          : poll
      )
    );

    // Then send the vote to the server
    await api.post(
      `/poll/${pollId}/vote`,
      { option },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // No need to refetch polls after vote; WebSocket will update the tally in real-time
  } catch (err) {
    console.error('Voting error:', err);
  }
};

useEffect(() => {
  fetchPolls();

  // Global WebSocket for new polls
  const newPollWs = new WebSocket('ws://localhost:3000/poll/global'); // Can be any dummy path

  newPollWs.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'newPoll') {
      const newPoll = message.data;

      setPolls((prevPolls) => [newPoll, ...prevPolls]); // Add to top
      setupWebSocket(newPoll.id); // Setup real-time tally for the new poll
    }
  };

  newPollWs.onclose = () => {
    console.log('Global newPoll WebSocket closed');
  };

  return () => {
    newPollWs.close();
    // Also close all individual poll WebSockets
    Object.values(wsConnections).forEach((ws) => ws.close());
  };
}, []);


  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Create Poll</h2>
        <input
          type="text"
          placeholder="Poll Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Options (comma separated)"
          value={options}
          onChange={(e) => setOptions(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded"
          onClick={handleCreatePoll}
        >
          Create Poll
        </button>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </div>

      <h2 className="text-xl font-bold">All Polls</h2>
      <div className="space-y-4">
        {polls.map((poll) => (
          <div key={poll.id} className="p-4 bg-gray-100 rounded shadow">
            <h3 className="font-semibold">{poll.question}</h3>
            <ul>
             {poll.options.map((option, idx) => (
  <li key={idx} className="flex items-center gap-4 mt-1">
    <button
      className="bg-green-500 text-white px-2 py-1 rounded"
      onClick={() => handleVote(poll.id, option)}
    >
      Vote
    </button>
    <span>
      {option} — {poll.tally?.[option] || 0} votes
    </span>
  </li>
))}

            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Polls;
