const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
} = require('graphql');
const axios = require('axios');

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  // we wrapped "fields" in arrow function because field "users"
  // has reference to "UserType" which defined below
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: GraphQLList(UserType),
      resolve(parentValue) {
        return axios
          .get(`http://localhost:3000/companies/${parentValue.id}/users`)
          .then(res => res.data);
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: 'User',
  // we wrapped "fields" in arrow function for the case when
  // we need some variables defined below this type
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue) {
        return axios
          .get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then(res => res.data);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    users: {
      type: GraphQLList(UserType),
      resolve() {
        return axios.get('http://localhost:3000/users').then(res => res.data);
      },
    },
    company: {
      type: CompanyType,
      args: { companyId: { type: GraphQLString } },
      resolve(_, args) {
        return axios
          .get(`http://localhost:3000/companies/${args.companyId}`)
          .then(response => response.data);
      },
    },
    user: {
      type: UserType,
      args: { userId: { type: GraphQLString } },
      resolve(_, args) {
        return axios
          .get(`http://localhost:3000/users/${args.userId}`)
          .then(response => response.data);
      },
    },
  },
});

const RootMutation = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString },
      },
      resolve(parentValue, args) {
        console.log('parentValue', parentValue);
        console.log('args', args);
        const newUser = {
          ...args,
          id: '66',
        };
        return axios
          .post('http://localhost:3000/users', newUser)
          .then(res => res.data);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
