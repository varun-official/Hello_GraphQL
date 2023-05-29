/** @format */
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const expressGraphQL = require("express-graphql").graphqlHTTP;
const Book = require("./models/Book");
const Author = require("./models/Author");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");
const app = express();

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  .then(() => {
    console.log("DB Connection established");
  });

//static data

// const authors = [
//   { id: 1, name: "J. K. Rowling" },
//   { id: 2, name: "J. R. R. Tolkien" },
//   { id: 3, name: "Brent Weeks" },
// ];

// const books = [
//   { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
//   { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
//   { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
//   { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
//   { id: 5, name: "The Two Towers", authorId: 2 },
//   { id: 6, name: "The Return of the King", authorId: 2 },
//   { id: 7, name: "The Way of Shadows", authorId: 3 },
//   { id: 8, name: "Beyond the Shadows", authorId: 3 },
// ];

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book written by an author",
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(GraphQLString) },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return Author.findById(book.authorId) || [];
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "This represents a author of a book",
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => {
        return Book.findById(author.authorId) || [];
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    book: {
      type: BookType,
      description: "A Single Book",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => Book.findById(args.id),
    },
    books: {
      type: new GraphQLList(BookType),
      description: "List of All Books",
      resolve: () => Book.find(),
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of All Authors",
      resolve: () => Author.find(),
    },
    author: {
      type: AuthorType,
      description: "A Single Author",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => Author.findById(args.id),
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addBook: {
      type: BookType,
      description: "Add a book",
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const book = new Book({
          name: args.name,
          authorId: args.authorId,
        });
        book.save();
        return book;
      },
    },
    addAuthor: {
      type: AuthorType,
      description: "Add an author",
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const author = new Author({ name: args.name });
        author.save();
        return author;
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
  expressGraphQL({
    schema: schema,
    graphiql: true,
  })
);
app.listen(5000, () => console.log("Server Running"));
