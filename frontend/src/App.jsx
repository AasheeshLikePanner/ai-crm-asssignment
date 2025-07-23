import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Deals from './pages/Deals';
import Interactions from './pages/Interactions';
import Files from './pages/Files';
import Exports from './pages/Exports';
import { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarProvider } from './components/ui/sidebar';
import { Nav } from './components/nav';
import { PanelLeft } from 'lucide-react';
import { Toaster } from 'sonner';

function App() {
    return (
        <Router>
            <SidebarProvider>
                <div className="flex min-h-screen w-screen">
                    <Sidebar collapsible="icon">
                        <SidebarHeader>
                            <SidebarTrigger className="rounded-full p-2">
                                <PanelLeft className="h-5 w-5" />
                            </SidebarTrigger>
                        </SidebarHeader>
                        <SidebarContent className="p-4">
                            <Nav />
                        </SidebarContent>
                    </Sidebar>
                    <main className="flex-1 flex flex-col">
                    <div className="h-full w-full">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/deals" element={<Deals />} />
                            <Route path="/interactions" element={<Interactions />} />
                            <Route path="/files" element={<Files />} />
                            <Route path="/exports" element={<Exports />} />
                        </Routes>
                    </div>
                </main>
                </div>
                <Toaster />
            </SidebarProvider>
        </Router>
    );
}

export default App;
