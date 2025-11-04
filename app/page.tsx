import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { FieldBackground } from '@/components/FieldBackground';
import { SheepFlock } from '@/components/SheepFlock';
import { SheepAnimation } from '@/components/SheepAnimation';
import { Users, FileText, Vote, UserPlus } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Browse DReps',
      description: 'Explore Delegated Representatives, their voting history, and statistics',
      link: '/dreps',
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Governance Actions',
      description: 'View live and past governance actions with detailed voting results',
      link: '/actions',
    },
    {
      icon: <Vote className="w-8 h-8" />,
      title: 'Delegate Voting',
      description: 'Delegate your voting rights to a DRep of your choice',
      link: '/delegate',
    },
    {
      icon: <UserPlus className="w-8 h-8" />,
      title: 'Register as DRep',
      description: 'Become a Delegated Representative and participate in governance',
      link: '/register-drep',
    },
  ];

  return (
    <FieldBackground>
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <SheepAnimation size="lg" className="mr-4" />
            <h1 className="text-6xl font-display font-bold bg-gradient-to-r from-field-green to-field-dark bg-clip-text text-transparent dark:from-field-light dark:to-field-green">
              GovTwool
            </h1>
          </div>
          <p className="text-2xl text-foreground mb-4 font-medium">Cardano Governance Made Simple</p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            A playful platform for participating in Cardano on-chain governance. 
            Browse DReps, vote on actions, and make your voice heard in the Cardano ecosystem.
          </p>
          <SheepFlock count={5} className="mb-12" />
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/dashboard">
              <Button size="lg" variant="primary">
                View Dashboard
              </Button>
            </Link>
            <Link href="/dreps">
              <Button size="lg" variant="secondary">
                Explore DReps
              </Button>
            </Link>
            <Link href="/actions">
              <Button size="lg" variant="outline">
                View Actions
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {features.map((feature, index) => (
            <Link key={index} href={feature.link} className="block h-full">
              <Card className="h-full cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover border-2 border-field-green/20 hover:border-field-green">
                <CardContent className="p-6">
                  <div className="text-field-green mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">About GovTwool</h2>
              <p className="text-muted-foreground mb-4">
                GovTwool is a user-friendly interface for Cardano's on-chain governance system. 
                Built with Next.js 16 and powered by Mesh SDK and Blockfrost API, it provides 
                an intuitive way to interact with Cardano governance features.
              </p>
              <p className="text-muted-foreground">
                Whether you're looking to delegate your voting rights, register as a DRep, 
                or simply explore the governance landscape, GovTwool makes it easy and fun.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </FieldBackground>
  );
}

