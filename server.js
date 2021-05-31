const express = require("express");
const expressGraphQl = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
} = require("graphql");

const database = require("./database");

const app = express();

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book written by an author",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (book) => {
        {
          return database.authors.find((author) => author.id === book.authorId);
        }
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "This represents an Author",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: GraphQLList(BookType),
      resolve: (author) =>
        database.books.filter((book) => book.authorId === author.id),
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root  Query",
  fields: () => ({
    //------------- Single fields --------------//
    book: {
      type: BookType,
      description: "Single Book",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (p, args) => database.books.find((book) => book.id === args.id),
    },
    author: {
      type: AuthorType,
      description: "Single Author",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (p, args) =>
        database.authors.find((author) => author.id === args.id),
    },
    //------------- List fields --------------//
    books: {
      type: new GraphQLList(BookType),
      description: "List of All Books",
      resolve: () => database.books,
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of All Authors",
      resolve: () => database.authors,
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Mutation fields",
  fields: () => ({
    addBook: {
      description: "add a book",
      type: BookType,
      args: {
        name: { type: GraphQLString },
        id: { type: GraphQLInt },
        authorId: { type: GraphQLInt },
      },
      resolve: (perent, args) => {
        const book = {
          id: database.books.length + 1,
          name: args.name,
          authorId: args.authorId,
        };
        database.books.push(book);
        return book;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use(
  "/graphql",
  expressGraphQl.graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(5000, () => console.log("Server running on" + 5000));
