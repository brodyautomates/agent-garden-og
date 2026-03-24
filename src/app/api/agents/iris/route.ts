import { NextRequest, NextResponse } from 'next/server';

interface ApolloFilters {
  person_titles?: string[];
  person_seniorities?: string[];
  q_organization_domains_list?: string[];
  organization_industry_tag_ids?: string[];
  organization_num_employees_ranges?: string[];
  person_locations?: string[];
  q_keywords?: string;
  page?: number;
  per_page?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      titles = ['CEO', 'COO', 'Founder', 'Head of Operations'],
      seniorities = ['c_suite', 'founder', 'vp', 'director'],
      employeeRanges = ['1,50', '51,200'],
      locations = ['United States'],
      keywords = '',
      page = 1,
      perPage = 25,
    } = body;

    const filters: ApolloFilters = {
      person_titles: titles,
      person_seniorities: seniorities,
      organization_num_employees_ranges: employeeRanges,
      person_locations: locations,
      page,
      per_page: perPage,
    };

    if (keywords) {
      filters.q_keywords = keywords;
    }

    const res = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.APOLLO_API_KEY || '',
      },
      body: JSON.stringify(filters),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Apollo API error:', res.status, errorText);
      return NextResponse.json(
        { error: `Apollo API returned ${res.status}`, details: errorText },
        { status: res.status },
      );
    }

    const data = await res.json();

    // Transform Apollo response into clean lead format
    const leads = (data.people || []).map((person: Record<string, unknown>) => {
      const org = (person.organization || {}) as Record<string, unknown>;
      return {
        id: person.id,
        name: `${person.first_name || ''} ${person.last_name || ''}`.trim(),
        firstName: person.first_name || '',
        lastName: person.last_name || '',
        title: person.title || '—',
        company: org.name || '—',
        industry: org.industry || '—',
        employees: org.estimated_num_employees || '—',
        location: person.city
          ? `${person.city}${person.state ? ', ' + person.state : ''}`
          : '—',
        linkedinUrl: person.linkedin_url || null,
        email: person.email || null,
        emailStatus: person.email_status || null,
        headline: person.headline || '',
        seniority: person.seniority || '—',
      };
    });

    return NextResponse.json({
      leads,
      total: data.pagination?.total_entries || 0,
      page: data.pagination?.page || 1,
      perPage: data.pagination?.per_page || 25,
      totalPages: data.pagination?.total_pages || 0,
    });
  } catch (error) {
    console.error('Iris agent error:', error);
    return NextResponse.json(
      { error: 'Iris failed to run' },
      { status: 500 },
    );
  }
}
