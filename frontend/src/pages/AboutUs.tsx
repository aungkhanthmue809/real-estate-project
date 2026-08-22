import {
  Target,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Server,
  Database,
  Monitor,
  Braces,
  GitBranch,
  GraduationCap,
} from 'lucide-react';

import { Link } from 'react-router-dom';

const TECH_STACK = [
  {
    icon: Server,
    label: 'Backend Framework',
    items: ['Java 17+', 'Spring Boot', 'Spring Web', 'Data JPA', 'Security'],
  },
  {
    icon: Database,
    label: 'Database & Persistence',
    items: ['PostgreSQL', 'Optimized relational schemas'],
  },
  {
    icon: Monitor,
    label: 'Frontend & UI',
    items: ['React', 'Thymeleaf', 'HTML5', 'CSS3', 'JavaScript (ES6+)'],
  },
  {
    icon: Braces,
    label: 'API Protocol',
    items: ['RESTful JSON APIs'],
  },
  {
    icon: GitBranch,
    label: 'Development & Collaboration',
    items: ['IntelliJ IDEA', 'VS Code', 'Git', 'GitHub'],
  },
];

const TEAM = [
  {
    avatar: 'lead',
    name: 'Project Lead',
    role: 'Full-Stack Developer',
    desc: 'System Architecture & Spring Boot Integration',
    tag: 'Member 1',
  },
  {
    avatar: 'backend-lead',
    name: 'Backend Lead',
    role: 'Database Engineer',
    desc: 'Database Design (PostgreSQL) & Data JPA Repositories',
    tag: 'Member 2',
  },
  {
    avatar: 'backend',
    name: 'Backend Engineer',
    role: 'REST API Developer',
    desc: 'REST API Development & Business Logic',
    tag: 'Member 3',
  },
  {
    avatar: 'frontend-lead',
    name: 'Frontend Lead',
    role: 'React Developer',
    desc: 'React Component Architecture & State Management',
    tag: 'Member 4',
  },
  {
    avatar: 'frontend',
    name: 'Frontend Engineer',
    role: 'UI/UX Designer',
    desc: 'UI/UX Design, Thymeleaf Templating & CSS Styling',
    tag: 'Member 5',
  },
  {
    avatar: 'qa',
    name: 'QA & Documentation',
    role: 'Tester / Documenter',
    desc: 'System Testing, API Validation & Project Documentation',
    tag: 'Member 6',
  },
];

export function AboutUs() {
  return (
    <div className="about-page">
      <div className="about-container">

        {/* Hero */}
        <section className="about-hero">
          <div className="about-hero-overlay" />

          <div className="about-hero-content">
            <span className="about-hero-badge">
              University Project
            </span>

            <h1 className="about-hero-title">
              Connecting People to Their Ideal Spaces
            </h1>

            <p className="about-hero-sub">
              A modern, web-based platform streamlining property discovery
              and real estate management.
            </p>

            <Link to="/" className="about-hero-btn">
              Explore Listings
            </Link>
          </div>
        </section>


        {/* Mission & Vision */}
        <section className="about-section about-mission-section">
          <div className="about-section-head">
            <span className="about-kicker">
              Project Context
            </span>

            <h2 className="about-section-title">
              Our Mission &amp; Vision
            </h2>
          </div>

          <div className="about-mv-grid">

            <div className="about-mv-card">
              <div className="about-mv-icon blue">
                <Target />
              </div>

              <h3 className="about-mv-title">
                Our Mission
              </h3>

              <p className="about-mv-desc">
                To eliminate friction in real estate transactions by replacing
                fragmented social media groups and manual record-keeping with
                an organized, direct-connect property platform.
              </p>
            </div>


            <div className="about-mv-card">
              <div className="about-mv-icon violet">
                <Eye />
              </div>

              <h3 className="about-mv-title">
                Our Vision
              </h3>

              <p className="about-mv-desc">
                To deliver a high-performance enterprise solution powered by
                Java Spring Boot and modern web technologies that empowers buyers and sellers with seamless property discovery.
              </p>
            </div>

          </div>
        </section>


        {/* Problem & Solution */}
        <section className="about-section about-problem-section">
          <div className="about-section-head">
            <span className="about-kicker">
              Why UrbanNest
            </span>

            <h2 className="about-section-title">
              The Problem &amp; Our Solution
            </h2>
          </div>


          <div className="about-ps-grid">

            <div className="about-ps-card problem">

              <h3 className="about-ps-title">
                <AlertCircle />
                The Challenge
              </h3>

              <ul className="about-ps-list">

                <li>
                  <XCircle />

                  <div>
                    <strong>
                      Unorganized Data
                    </strong>

                    <span>
                      Property records scattered across unstructured groups
                      and paper logs.
                    </span>
                  </div>
                </li>


                <li>
                  <XCircle />

                  <div>
                    <strong>
                      Inefficient Searching
                    </strong>

                    <span>
                      Buyers spend hours making calls to verify simple details.
                    </span>
                  </div>
                </li>


                <li>
                  <XCircle />

                  <div>
                    <strong>
                      Communication Friction
                    </strong>

                    <span>
                      Middlemen and multi-layered agent delays.
                    </span>
                  </div>
                </li>

              </ul>
            </div>


            <div className="about-ps-card solution">

              <h3 className="about-ps-title">
                <CheckCircle />
                Our Solution
              </h3>

              <ul className="about-ps-list">

                <li>
                  <CheckCircle />

                  <div>
                    <strong>
                      Centralized Management
                    </strong>

                    <span>
                      Full CRUD tools enabling sellers to update property
                      specifications and images instantly.
                    </span>
                  </div>
                </li>


                <li>
                  <CheckCircle />

                  <div>
                    <strong>
                      Smart Filtering Engine
                    </strong>

                    <span>
                      Dynamic range and location filters backed by Spring Data
                      JPA &amp; PostgreSQL queries.
                    </span>
                  </div>
                </li>


                <li>
                  <CheckCircle />

                  <div>
                    <strong>
                      Direct Contact Links
                    </strong>

                    <span>
                      One-click communication via Direct Call and Viber.
                    </span>
                  </div>
                </li>

              </ul>
            </div>

          </div>
        </section>


        {/* Tech Stack */}
        <section className="about-section about-tech-section">
          <div className="about-section-head">
            <span className="about-kicker">
              Architecture
            </span>

            <h2 className="about-section-title">
              Technical Stack &amp; Architecture
            </h2>
          </div>


          <div className="about-tech-grid">
            {TECH_STACK.map((tech) => (
              <div
                className="about-tech-card"
                key={tech.label}
              >
                <div className="about-tech-icon">
                  <tech.icon />
                </div>
                <div className="about-tech-label">
                  {tech.label}
                </div>

                <div className="about-tech-chips">
                  {tech.items.map((item) => (
                    <span
                      className="about-tech-chip"
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* Team */}
        <section className="about-section about-team-section">
          <div className="about-section-head">
            <span className="about-kicker">
              The Team
            </span>

            <h2 className="about-section-title">
              Meet the Development Team
            </h2>
          </div>


          <div className="about-team-grid">
            {TEAM.map((member) => (
              <div
                className="about-team-card"
                key={member.tag}
              >
                <span className="about-team-tag">
                  {member.tag}
                </span>

                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`}
                  alt={member.name}
                  className="about-team-avatar"
                />

                <div className="about-team-name">
                  {member.name}
                </div>

                <div className="about-team-role">
                  {member.role}
                </div>

                <p className="about-team-desc">
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </section>


        {/* Academic Disclaimer */}
        <section className="about-disclaimer">

          <div className="about-disclaimer-icon">
            <GraduationCap />
          </div>

          <h3 className="about-disclaimer-title">
            Academic Project Note
          </h3>

          <p className="about-disclaimer-desc">
            This platform was developed as an academic software engineering
            project for Java Enterprise development. While fully functional
            for real estate listing and discovery, financial transactions and
            escrow handling are conducted independently between buyers and
            sellers outside the application.
          </p>

        </section>

      </div>
    </div>
  );
}