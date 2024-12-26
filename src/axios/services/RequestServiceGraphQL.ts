/* eslint-disable class-methods-use-this */
import { AuthCredentials } from 'src/interfaces/auth/userInterfaces';
import { graphqlRequest } from '../graphqlClient';

class RequestServiceGraphQL {
  fetchLoginUser = async (databody: AuthCredentials) => {
    const query = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
          user {
            id
            namex
          }
        }
      }
    `;
    const variables = { email: databody.email, password: databody.password };
    return graphqlRequest(query, variables);
  };

  fetchGetUserById = async (id: string) => {
    const query = `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
        }
      }
    `;
    const variables = { id };
    return graphqlRequest(query, variables);
  };
}

export default new RequestServiceGraphQL();
