export const getAvatarUrl = (avatarUrl?: string | null, name?: string | null) => {
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl;
  }
  const seed = encodeURIComponent(name || 'User');
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=e2e8f0`;
};
