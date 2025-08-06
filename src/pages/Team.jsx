import './Team.scss';                 // optional style file
import { FaLinkedin, FaEnvelope } from 'react-icons/fa';

// ⇣  all paths go UP one level from /pages
import RakshandaImg from '../media/team/Rakshanda.jpeg';
import SamImg        from '../media/team/Sam.jpeg';
import ColeImg       from '../media/team/Cole.jpeg';
import RuiqiImg      from '../media/team/Ruiqi.jpeg';
import KhoaImg       from '../media/team/Khoa.jpeg';
import SamridhImg    from '../media/team/Samridh.jpeg';
import NathanImg     from '../media/team/Nathan.jpeg';

const team = [
 
  {
    name: 'Sam Mata',
    img: SamImg,
    linkedin: 'https://www.linkedin.com/in/sam-mata-3048108b/',
    email: 'sam@claimrunner.ai',
  },
   {
    name: 'Nathan Lee',
    img: NathanImg,
    linkedin: 'https://www.linkedin.com/in/nathanleeuw/',
    email: 'nathanlee00873@gmail.com',
  },
  {
    name: 'Ruiqi Wei',
    img: RuiqiImg,
    linkedin: 'https://www.linkedin.com/in/ruiqiwei/',
    email: 'ruwei@uw.edu',
  },
  {
    name: 'Cole DuBois',
    img: ColeImg,
    linkedin: 'https://www.linkedin.com/in/coledubois/',
    email: 'contactcole@gmail.com',
  },
   {
    name: 'Rakshanda B.',
    img: RakshandaImg,
    linkedin: 'https://www.linkedin.com/in/rakkshanda/',
    email: 'rakksh@uw.edu',
  },
  {
    name: 'Khoa Luong',
    img: KhoaImg,
    linkedin: 'https://www.linkedin.com/in/khoaluong99/',
    email: 'khoal@uw.edu',
  },
  {
    name: 'Samridh B.',
    img: SamridhImg,
    linkedin: 'https://www.linkedin.com/in/samridhb/',
    email: 'samridhb@gmail.com',
  }
];

export default function Team() {
  return (
    <section className="team">
      <h1>Meet the Team</h1>

      <div className="grid">
        {team.map(({ name, img, linkedin, email }) => (
          <article key={name} className="card">
            <img src={img} alt={name} />
            <h3>{name}</h3>

            <div className="links">
              <a href={linkedin} target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </a>
              <a href={`mailto:${email}`}>
                <FaEnvelope />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
