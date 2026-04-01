import Link from 'next/link';
import { Brain, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Brain className="w-16 h-16 mx-auto text-muted-foreground" />
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">Memory not found</p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
