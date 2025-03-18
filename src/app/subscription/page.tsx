'use client';

export default function SubscriptionPage() {
  return (
    <div className="container p-4 w-full">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold mb-6">Abonnement</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Plan Gratuit</h2>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2">Accès aux articles publics</span>
              </li>
            </ul>
            <button className="btn-primary w-full">Actuel</button>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Premium</h2>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2">Accès à tout le contenu</span>
              </li>
            </ul>
            <button className="btn-secondary w-full">Souscrire</button>
          </div>
        </div>
      </div>
    </div>
  );
}
