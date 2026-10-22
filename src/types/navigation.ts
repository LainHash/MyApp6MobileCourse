import { Book, Reader } from "./index";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  BookDetail: { bookId: number };
  BookForm: { book?: Book };
  ReaderDetail: { readerId: number };
  ReaderForm: { reader?: Reader };
  CreateBorrow: { preselectedBookId?: number; preselectedReaderId?: number };
  BorrowDetail: { borrowId: number };
  Settings: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  BooksTab: undefined;
  BorrowsTab: undefined;
  ReadersTab: undefined;
};
