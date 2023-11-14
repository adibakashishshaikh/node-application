// App.js
import React from "react";
import { useQuery, gql } from "@apollo/client";

const YOUR_QUERY = gql`
  {
    users {
      id
      firstname
      lastname
      location
    }
  }
`;

function App() {
  const { data, loading, error } = useQuery(YOUR_QUERY);

  if (loading) return "Loading...";
  if (error) return <pre>{error.message}</pre>;

 const sortedUsers = data.users.slice().sort((a, b) => a.id - b.id);

  return (
    <div>
      <h1>Users Information</h1>
      <table border="3px solid black">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.firstname}</td>
              <td>{user.lastname}</td>
              <td>{user.location}</td>
            </tr>
          ))}
        </tbody>
     </table>

 
    </div>
  );
}

export default App;



