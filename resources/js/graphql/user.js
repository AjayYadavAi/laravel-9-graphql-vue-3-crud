import gql from 'graphql-tag'

export const USERS_QUERY = gql`
    query userlist {
        userlist {
          data{
            id
            name
            email
          }
        }
    }
`

export const CREATE_USER = gql`
  mutation createUser (
    $name: String!
    $email: String!
    $password: String!
  ) {
    createUser (input:{
        name: $name
        email: $email
        password: $password
    }) {
      id
      name
      email
    }
  }
`

export const UPDATE_USER = gql`
  mutation updateUser (
    $id : ID!
    $name: String!
    $password: String!
  ) {
    updateUser (id : $id, input:{
        name: $name
        password: $password
    }) {
      id
      name
      email
    }
  }
`

export const REMOVE_USER = gql`
  mutation deleteUser ($id : ID!) {
    deleteUser (id : $id) {
      id
      name
      email
    }
  }
`
