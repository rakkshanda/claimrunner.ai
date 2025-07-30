import './Team.scss';

const teamMembers = [

  {
    name: 'Sam',
    linkedin: 'https://www.linkedin.com/in/sam',
    img: '/profile.jpg'
  },
   {
    name: 'Nathan',
    linkedin: 'https://www.linkedin.com/in/nathan',
    img: '/profile.jpg'
  },
  {
    name: 'Ruiqi',
    linkedin: 'https://www.linkedin.com/in/ruiqi',
    img: '/profile.jpg'
  },

  {
    name: 'Cole',
    linkedin: 'https://www.linkedin.com/in/cole',
    img: '/profile.jpg'
  },
    {
    name: 'Rakshanda',
    linkedin: 'https://www.linkedin.com/in/rakshanda',
    img: '/profile.jpg'
  },
    {
    name: 'Khoa',
    linkedin: 'https://www.linkedin.com/in/khoa',
    img: '/profile.jpg'
  },
  {
    name: 'Samridh',
    linkedin: 'https://www.linkedin.com/in/samridh',
    img: '/profile.jpg'
  },
 
  
];

function Team() {
  return (
    <div className="team-page">
      <h1>Meet the Team</h1>
      <div className="team-grid">
        {teamMembers.map((member, i) => (
          <div className="team-card" key={i}>
            <img src={member.img} alt={member.name} />
            <h3>{member.name}</h3>
            <a href={member.linkedin} target="_blank" rel="noreferrer">
              LinkedIn →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Team;
