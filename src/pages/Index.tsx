import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Vote, BarChart3, Users, Shield } from "lucide-react";

export default function Index() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Vote className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              VoteHub
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
              <Vote className="h-8 w-8 text-primary" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Create & Share
              <span className="block bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                Polls in Seconds
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              VoteHub makes it simple to gather opinions, make decisions, and understand what people think. Create polls, collect votes, and view real-time results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto">
                      View Dashboard
                    </Button>
                  </Link>
                  <Link to="/create">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Create Poll
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Explore Polls
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Real-time Results</h3>
                <p className="text-muted-foreground">
                  Watch votes come in live and see results update instantly as people participate
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-success" />
                </div>
                <h3 className="text-xl font-semibold">Easy to Share</h3>
                <p className="text-muted-foreground">
                  Share your polls with anyone and collect responses from your community
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Secure Voting</h3>
                <p className="text-muted-foreground">
                  One vote per person ensures fair and accurate poll results every time
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <Card className="bg-gradient-to-r from-primary to-success text-white border-0 max-w-4xl mx-auto">
            <CardContent className="py-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Get Started?
              </h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Join VoteHub today and start creating polls that matter. It's free and takes less than a minute.
              </p>
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="mt-4">
                  Create Your First Poll
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 VoteHub. Making voting simple and accessible.</p>
        </div>
      </footer>
    </div>
  );
}
