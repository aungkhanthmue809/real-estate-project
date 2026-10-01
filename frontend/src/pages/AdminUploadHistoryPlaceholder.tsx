import { Link } from 'react-router-dom';

export function AdminUploadHistoryPlaceholder() {
  return (
    <div className="admin-page admin-showcase-page admin-cockpit admin-placeholder-page">
      <main className="admin-cockpit-main">
        <section className="admin-cockpit-intro">
          <div><span className="admin-header-kicker"><i />Coming next</span><h1>Upload History</h1><p>Detailed posting-fee history will be available in the next milestone.</p></div>
          <Link className="admin-revenue-see-more" to="/admin/dashboard">Back to Properties <span aria-hidden="true">→</span></Link>
        </section>
      </main>
    </div>
  );
}
