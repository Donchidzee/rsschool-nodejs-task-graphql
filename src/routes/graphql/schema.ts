import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLInputObjectType,
} from 'graphql';
import { UUIDType } from './types/uuid.js';

export function createSchema() {
  const MemberTypeIdEnum = new GraphQLEnumType({
    name: 'MemberTypeId',
    values: {
      BASIC: { value: 'BASIC' },
      BUSINESS: { value: 'BUSINESS' },
    },
  });

  const MemberTypeType = new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
      id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
      discount: { type: new GraphQLNonNull(GraphQLFloat) },
      postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
    }),
  });

  const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
      id: { type: new GraphQLNonNull(UUIDType) },
      title: { type: new GraphQLNonNull(GraphQLString) },
      content: { type: new GraphQLNonNull(GraphQLString) },
    }),
  });

  const ProfileType = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
      id: { type: new GraphQLNonNull(UUIDType) },
      isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
      yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
      memberType: {
        type: new GraphQLNonNull(MemberTypeType),
        resolve: (profile, args, context) => {
          return context.loaders.memberTypeById.load(profile.memberTypeId);
        },
      },
    }),
  });

  const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: { type: new GraphQLNonNull(UUIDType) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      balance: { type: new GraphQLNonNull(GraphQLFloat) },
      profile: {
        type: ProfileType,
        resolve: (user, args, context) => {
          return context.loaders.profileByUserId.load(user.id);
        },
      },
      posts: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
        resolve: (user, args, context) => {
          return context.loaders.postsByAuthorId.load(user.id);
        },
      },
      userSubscribedTo: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
        resolve: (user, args, context) => {
          return context.loaders.usersBySubscriberId.load(user.id);
        },
      },
      subscribedToUser: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
        resolve: (user, args, context) => {
          return context.loaders.usersByAuthorId.load(user.id);
        },
      },
    }),
  });

  const RootQueryType = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: () => ({
      users: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
        resolve: (parent, args, context) => {
          return context.prisma.user.findMany();
        },
      },
      memberTypes: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberTypeType))),
        resolve: (parent, args, context) => {
          return context.prisma.memberType.findMany();
        },
      },
      memberType: {
        type: MemberTypeType,
        args: { id: { type: new GraphQLNonNull(MemberTypeIdEnum) } },
        resolve: (parent, args, context) => {
          return context.prisma.memberType.findUnique({
            where: { id: args.id },
          });
        },
      },
      user: {
        type: UserType,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: (parent, args, context) => {
          return context.prisma.user.findUnique({
            where: { id: args.id },
          });
        },
      },
      posts: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
        resolve: (parent, args, context) => {
          return context.prisma.post.findMany();
        },
      },
      post: {
        type: PostType,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: (parent, args, context) => {
          return context.prisma.post.findUnique({
            where: { id: args.id },
          });
        },
      },
      profiles: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProfileType))),
        resolve: (parent, args, context) => {
          return context.prisma.profile.findMany();
        },
      },
      profile: {
        type: ProfileType,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: (parent, args, context) => {
          return context.prisma.profile.findUnique({
            where: { id: args.id },
          });
        },
      },
    }),
  });

  const CreateUserInputType = new GraphQLInputObjectType({
    name: 'CreateUserInput',
    fields: {
      name: { type: new GraphQLNonNull(GraphQLString) },
      balance: { type: new GraphQLNonNull(GraphQLFloat) },
    },
  });

  const ChangeUserInputType = new GraphQLInputObjectType({
    name: 'ChangeUserInput',
    fields: {
      name: { type: GraphQLString },
      balance: { type: GraphQLFloat },
    },
  });

  const CreateProfileInputType = new GraphQLInputObjectType({
    name: 'CreateProfileInput',
    fields: {
      isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
      yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
      userId: { type: new GraphQLNonNull(UUIDType) },
      memberTypeId: { type: new GraphQLNonNull(MemberTypeIdEnum) },
    },
  });

  const ChangeProfileInputType = new GraphQLInputObjectType({
    name: 'ChangeProfileInput',
    fields: {
      isMale: { type: GraphQLBoolean },
      yearOfBirth: { type: GraphQLInt },
      memberTypeId: { type: MemberTypeIdEnum },
    },
  });

  const CreatePostInputType = new GraphQLInputObjectType({
    name: 'CreatePostInput',
    fields: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      content: { type: new GraphQLNonNull(GraphQLString) },
      authorId: { type: new GraphQLNonNull(UUIDType) },
    },
  });

  const ChangePostInputType = new GraphQLInputObjectType({
    name: 'ChangePostInput',
    fields: {
      title: { type: GraphQLString },
      content: { type: GraphQLString },
    },
  });

  const MutationsType = new GraphQLObjectType({
    name: 'Mutations',
    fields: () => ({
      createUser: {
        type: new GraphQLNonNull(UserType),
        args: { dto: { type: new GraphQLNonNull(CreateUserInputType) } },
        resolve: (parent, args, context) => {
          return context.prisma.user.create({ data: args.dto });
        },
      },
      changeUser: {
        type: new GraphQLNonNull(UserType),
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeUserInputType) },
        },
        resolve: (parent, args, context) => {
          return context.prisma.user.update({
            where: { id: args.id },
            data: args.dto,
          });
        },
      },
      deleteUser: {
        type: new GraphQLNonNull(GraphQLString),
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (parent, args, context) => {
          await context.prisma.user.delete({ where: { id: args.id } });
          return 'User deleted successfully';
        },
      },
      createProfile: {
        type: new GraphQLNonNull(ProfileType),
        args: { dto: { type: new GraphQLNonNull(CreateProfileInputType) } },
        resolve: (parent, args, context) => {
          return context.prisma.profile.create({ data: args.dto });
        },
      },
      changeProfile: {
        type: new GraphQLNonNull(ProfileType),
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeProfileInputType) },
        },
        resolve: (parent, args, context) => {
          return context.prisma.profile.update({
            where: { id: args.id },
            data: args.dto,
          });
        },
      },
      deleteProfile: {
        type: new GraphQLNonNull(GraphQLString),
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (parent, args, context) => {
          await context.prisma.profile.delete({ where: { id: args.id } });
          return 'Profile deleted successfully';
        },
      },
      createPost: {
        type: new GraphQLNonNull(PostType),
        args: { dto: { type: new GraphQLNonNull(CreatePostInputType) } },
        resolve: (parent, args, context) => {
          return context.prisma.post.create({ data: args.dto });
        },
      },
      changePost: {
        type: new GraphQLNonNull(PostType),
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangePostInputType) },
        },
        resolve: (parent, args, context) => {
          return context.prisma.post.update({
            where: { id: args.id },
            data: args.dto,
          });
        },
      },
      deletePost: {
        type: new GraphQLNonNull(GraphQLString),
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (parent, args, context) => {
          await context.prisma.post.delete({ where: { id: args.id } });
          return 'Post deleted successfully';
        },
      },
      subscribeTo: {
        type: new GraphQLNonNull(GraphQLString),
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (parent, args, context) => {
          await context.prisma.subscribersOnAuthors.create({
            data: { subscriberId: args.userId, authorId: args.authorId },
          });
          return 'Subscribed successfully';
        },
      },
      unsubscribeFrom: {
        type: new GraphQLNonNull(GraphQLString),
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (parent, args, context) => {
          await context.prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: args.userId,
                authorId: args.authorId,
              },
            },
          });
          return 'Unsubscribed successfully';
        },
      },
    }),
  });

  return new GraphQLSchema({
    query: RootQueryType,
    mutation: MutationsType,
  });
}
