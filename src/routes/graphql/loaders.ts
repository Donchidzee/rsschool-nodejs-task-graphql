import DataLoader from 'dataloader';

export function createLoaders(context) {
  const { prisma } = context;

  return {
    profileByUserId: new DataLoader(async (userIds) => {
      const profiles = await prisma.profile.findMany({
        where: { userId: { in: userIds } },
      });
      const profileMap = new Map();
      profiles.forEach((profile) => {
        profileMap.set(profile.userId, profile);
      });
      return userIds.map((id) => profileMap.get(id));
    }),

    postsByAuthorId: new DataLoader(async (authorIds) => {
      const posts = await prisma.post.findMany({
        where: { authorId: { in: authorIds } },
      });
      const postsMap = new Map();
      authorIds.forEach((id) => {
        postsMap.set(id, []);
      });
      posts.forEach((post) => {
        postsMap.get(post.authorId)?.push(post);
      });
      return authorIds.map((id) => postsMap.get(id) || []);
    }),

    memberTypeById: new DataLoader(async (memberTypeIds) => {
      const memberTypes = await prisma.memberType.findMany({
        where: { id: { in: memberTypeIds } },
      });
      const memberTypeMap = new Map();
      memberTypes.forEach((memberType) => {
        memberTypeMap.set(memberType.id, memberType);
      });
      return memberTypeIds.map((id) => memberTypeMap.get(id));
    }),

    usersBySubscriberId: new DataLoader(async (subscriberIds) => {
      const subs = await prisma.subscribersOnAuthors.findMany({
        where: { subscriberId: { in: subscriberIds } },
        include: { author: true },
      });
      const subsMap = new Map();
      subscriberIds.forEach((id) => {
        subsMap.set(id, []);
      });
      subs.forEach((sub) => {
        subsMap.get(sub.subscriberId)?.push(sub.author);
      });
      return subscriberIds.map((id) => subsMap.get(id) || []);
    }),

    usersByAuthorId: new DataLoader(async (authorIds) => {
      const subs = await prisma.subscribersOnAuthors.findMany({
        where: { authorId: { in: authorIds } },
        include: { subscriber: true },
      });
      const subsMap = new Map();
      authorIds.forEach((id) => {
        subsMap.set(id, []);
      });
      subs.forEach((sub) => {
        subsMap.get(sub.authorId)?.push(sub.subscriber);
      });
      return authorIds.map((id) => subsMap.get(id) || []);
    }),
  };
}
