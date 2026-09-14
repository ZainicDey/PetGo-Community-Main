import { Thread } from './ThreadCard';

/* ── Seed Data ── */
const SEED_THREADS: Thread[] = [
  {
    id: '1',
    author: 'Rahul Ahmed',
    handle: 'rahulahmed',
    content:
      '🐾 Just adopted a golden retriever named Mango! He already owns the couch and my heart. Best decision of my life. #PetGo #GoldenRetriever',
    media: [
      { url: 'https://picsum.photos/seed/mango1/400/500', type: 'image' },
      { url: 'https://picsum.photos/seed/mango2/400/500', type: 'image' },
      { url: 'https://picsum.photos/seed/mango3/400/500', type: 'image' },
      { url: 'https://picsum.photos/seed/mango4/400/500', type: 'image' },
    ],
    likes: 2481,
    replies: 189,
    reposts: 172,
    time: '2h',
  },
  {
    id: '2',
    author: 'Nadia Islam',
    handle: 'nadiaislam',
    content:
      'Reminder: summer heat is dangerous for pets 🌡️ Keep water accessible at all times, avoid walks during peak hours (12–4pm), and never leave your pet in a parked car. Stay safe everyone! 🐶🐱',
    likes: 1730,
    replies: 94,
    reposts: 445,
    time: '5h',
    liked: true,
  },
  {
    id: '3',
    author: 'Kazi Farhan',
    handle: 'kazifarhan',
    content:
      'My cat Luna has been doing this thing where she just stares at me while I eat. She has her own bowl. She has been fed. She is plotting something.',
    likes: 6120,
    replies: 241,
    reposts: 1830,
    time: '9h',
  },
  {
    id: '4',
    author: 'Sinthia Chowdhury',
    handle: 'sinthiac',
    content:
      "PetGo's new vet-finder feature is a lifesaver! Found a great local vet in under 2 minutes for my rabbit, Biscuit. Highly recommend 🐰✨",
    media: [
      { url: 'https://picsum.photos/seed/biscuit1/400/400', type: 'image' },
      { url: 'https://picsum.photos/seed/biscuit2/400/400', type: 'image' },
    ],
    likes: 892,
    replies: 45,
    reposts: 113,
    time: '12h',
  },
  {
    id: '5',
    author: 'Arif Hossain',
    handle: 'arifhossain',
    content:
      'Hot take: cats are better apartment pets than dogs. Change my mind. (Please, my dog is destroying my couch as I type this 😭)',
    likes: 3400,
    replies: 772,
    reposts: 225,
    time: '1d',
  },
  {
    id: '6',
    author: 'Mehrin Sultana',
    handle: 'mehrins',
    content:
      'Our foster cat Zara had her kittens last night! 🐱🐱🐱 Four little fluffballs, all healthy. Will be posting updates. If anyone in Dhaka is interested in adopting, DM me through PetGo!',
    likes: 5211,
    replies: 388,
    reposts: 894,
    time: '1d',
  },
  {
    id: '7',
    author: 'Tanvir Alam',
    handle: 'tanviralam',
    content:
      "Pro tip for new pet owners: record a short video of your pet every month. You think you'll remember how tiny they were when you first got them but you won't. Future you will thank present you. 🐶❤️",
    likes: 11200,
    replies: 512,
    reposts: 4300,
    time: '2d',
  },
  {
    id: '8',
    author: 'Farzana Begum',
    handle: 'farzanabegum',
    content:
      "Vet bills can be brutal 💸 Is anyone else using a pet health insurance plan? Thinking of signing up for one before my dog Oreo inevitably eats something he shouldn't.",
    likes: 1890,
    replies: 263,
    reposts: 88,
    time: '2d',
  },
];

export default SEED_THREADS;

export function getThreadById(id: string): Thread | undefined {
  return SEED_THREADS.find((t) => t.id === id);
}
