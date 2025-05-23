import { ReactNode } from "react";
import { Helmet } from "react-helmet";

interface StaticPageLayoutProps {
  title: string;
  description: string;
  keywords: string;
  children: ReactNode;
}

const StaticPageLayout = ({ title, description, keywords, children }: StaticPageLayoutProps) => {
  return (
    <div className="bg-gray-50 py-8 md:py-12">
      <Helmet>
        <title>{title} | NepQue</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
      </Helmet>
      
      <div className="container mx-auto px-4">
        <div className="mb-6">          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <div className="h-1 w-20 bg-blue-600 rounded mb-6"></div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StaticPageLayout;