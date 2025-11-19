import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Clock } from "lucide-react";

export default function PollView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [poll, setPoll] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user && id) {
      fetchPollData();
      checkIfVoted();
    }
  }, [user, id]);

  const fetchPollData = async () => {
    try {
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .select("*")
        .eq("id", id)
        .single();

      if (pollError) throw pollError;
      setPoll(pollData);

      const { data: optionsData, error: optionsError } = await supabase
        .from("poll_options")
        .select("*")
        .eq("poll_id", id);

      if (optionsError) throw optionsError;
      setOptions(optionsData || []);

      await fetchResults();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load poll",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from("poll_results")
        .select("*")
        .eq("poll_id", id);

      if (error) throw error;
      setResults(data || []);
    } catch (error: any) {
      console.error("Error fetching results:", error);
    }
  };

  const checkIfVoted = async () => {
    try {
      const { data, error } = await supabase
        .from("votes")
        .select("*")
        .eq("poll_id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      setHasVoted((data || []).length > 0);
    } catch (error: any) {
      console.error("Error checking vote:", error);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) {
      toast({
        title: "Error",
        description: "Please select an option",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("votes").insert({
        poll_id: id,
        option_id: selectedOption,
        user_id: user.id,
      });

      if (error) throw error;

      setHasVoted(true);
      await fetchResults();

      toast({
        title: "Success",
        description: "Your vote has been recorded!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit vote",
        variant: "destructive",
      });
    }
  };

  const isExpired = poll?.expires_at && new Date(poll.expires_at) < new Date();
  const totalVotes = results.reduce((sum, r) => sum + r.vote_count, 0);

  if (!user || loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{poll?.title}</CardTitle>
                {poll?.description && (
                  <CardDescription className="text-base">
                    {poll.description}
                  </CardDescription>
                )}
              </div>
              {isExpired ? (
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Clock className="h-4 w-4" />
                  Ended
                </div>
              ) : (
                <div className="flex items-center gap-1 text-success text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Active
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!hasVoted && !isExpired ? (
              <>
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                  {options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        {option.option_text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button onClick={handleVote} className="w-full">
                  Submit Vote
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Results</h3>
                  <span className="text-sm text-muted-foreground">
                    {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
                  </span>
                </div>
                {results.map((result) => {
                  const percentage = totalVotes > 0 
                    ? Math.round((result.vote_count / totalVotes) * 100)
                    : 0;
                  
                  return (
                    <div key={result.option_id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{result.option_text}</span>
                        <span className="text-muted-foreground">
                          {result.vote_count} ({percentage}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
                {hasVoted && !isExpired && (
                  <p className="text-sm text-muted-foreground text-center pt-4">
                    Thank you for voting!
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
